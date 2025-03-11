import { ValidationError } from "objection";
import Base from "./base";
import Permission from "./permission";
import User from "./user";
import SamlAuthProvider from "./saml-auth-provider.ee";
import NotAuthorized from "../errors/not-authorized";

class Role extends Base {
    static tableName = 'roles';

    static jsonSchema = {
        type: 'object',
        required: ['name'],

        properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 1 },
            description: { type: ['string', 'null'], maxLength: 255 },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
        },
    }

    static relationMappings = () => ({
        users: {
          relation: Base.HasManyRelation,
          modelClass: User,
          join: {
            from: 'roles.id',
            to: 'users.role_id',
          },
        },
        permissions: {
          relation: Base.HasManyRelation,
          modelClass: Permission,
          join: {
            from: 'roles.id',
            to: 'permissions.role_id',
          },
        },
    });

    static get virtualAttributes() {
        return ['isAdmin'];
      }
    
    get isAdmin() {
        //@ts-ignore
        return this.name === 'Admin';
    }
    
    static async findAdmin() {
        return await this.query().findOne({ name: 'Admin' });
    }

    async preventAlteringAdmin() {
        //@ts-ignore
        const currentRole = await Role.query().findById(this.id);
        //@ts-ignore
        if (currentRole.isAdmin) {
            //@ts-ignore
          throw new NotAuthorizedError('The admin role cannot be altered!');
        }
    }

    async deletePermissions() {
        return await this.$relatedQuery('permissions').delete();
    }
    //@ts-ignore
    async createPermissions(permissions) {
        if (permissions?.length) {
          const validPermissions = Permission.filter(permissions).map(
            //@ts-ignore
            (permission) => ({
              ...permission,
              //@ts-ignore
              roleId: this.id,
            })
          );
    
          await Permission.query().insert(validPermissions);
        }
    }
    //@ts-ignore
    async updatePermissions(permissions) {
        await this.deletePermissions();
    
        await this.createPermissions(permissions);
    }
    //@ts-ignore
    async updateWithPermissions(data) {
        const { name, description, permissions } = data;
    
        await this.updatePermissions(permissions);
    
        await this.$query().patchAndFetch({
            //@ts-ignore
          id: this.id,
          name,
          description,
        });
    
        return await this.$query()
          .leftJoinRelated({
            permissions: true,
          })
          .withGraphFetched({
            permissions: true,
          });
    }

    async deleteWithPermissions() {
        await this.deletePermissions();
    
        return await this.$query().delete();
    }
    
    async assertNoRoleUserExists() {
        const userCount = await this.$relatedQuery('users').limit(1).resultSize();
        const hasUsers = userCount > 0;
    
        if (hasUsers) {
          throw new ValidationError({
            data: {
              role: [
                {
                //@ts-ignore
                  message: `All users must be migrated away from the "${this.name}" role.`,
                },
              ],
            },
            type: 'ValidationError',
          });
        }
    }

    async assertNoConfigurationUsage() {
        const samlAuthProviderUsingDefaultRole = await SamlAuthProvider.query()
          .where({
            //@ts-ignore
            default_role_id: this.id,
          })
          .limit(1)
          .first();
    
        if (samlAuthProviderUsingDefaultRole) {
          throw new ValidationError({
            data: {
              samlAuthProvider: [
                {
                  message:
                    'You need to change the default role in the SAML configuration before deleting this role.',
                },
              ],
            },
            type: 'ValidationError',
          });
        }
    }

    async assertRoleIsNotUsed() {
        await this.assertNoRoleUserExists();
    
        await this.assertNoConfigurationUsage();
    }
    //@ts-ignore
    async $beforeUpdate(opt, queryContext) {
        await super.$beforeUpdate(opt, queryContext);
    
        await this.preventAlteringAdmin();
    }
    //@ts-ignore
    async $beforeDelete(queryContext) {
        await super.$beforeDelete(queryContext);
    
        await this.preventAlteringAdmin();
    
        await this.assertRoleIsNotUsed();
    }
}

export default Role;