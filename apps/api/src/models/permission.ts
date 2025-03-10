import Base from "./base";
import permissionCatalog from "../helpers/permission-catalog.ee";

class Permission extends Base {
    static tableName = 'permissions';
  
    static jsonSchema = {
      type: 'object',
      required: ['roleId', 'action', 'subject'],
  
      properties: {
        id: { type: 'string', format: 'uuid' },
        roleId: { type: 'string', format: 'uuid' },
        action: { type: 'string', minLength: 1 },
        subject: { type: 'string', minLength: 1 },
        conditions: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
    //@ts-ignore
    static filter(permissions) {
//@ts-ignore
        const sanitizedPermissions = permissions.filter((permission) => {
        const { action, subject, conditions } = permission;
  
        const relevantAction = this.findAction(action);
        const validSubject = this.isSubjectValid(subject, relevantAction);
        const validConditions = this.areConditionsValid(conditions);
  
        return relevantAction && validSubject && validConditions;
      });
  
      return sanitizedPermissions;
    }
  //@ts-ignore
    static findAction(action) {
      return permissionCatalog.actions.find(
        (actionCatalogItem) => actionCatalogItem.key === action
      );
    }
  //@ts-ignore
    static isSubjectValid(subject, action) {
      return action && action.subjects.includes(subject);
    }
  //@ts-ignore
    static areConditionsValid(conditions) {
        //@ts-ignore
      return conditions.every((condition) => this.isConditionValid(condition));
    }
  //@ts-ignore
    static isConditionValid(condition) {
      return !!permissionCatalog.conditions.find(
        (conditionCatalogItem) => conditionCatalogItem.key === condition
      );
    }
}
  
export default Permission;
  