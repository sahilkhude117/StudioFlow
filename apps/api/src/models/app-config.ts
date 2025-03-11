import App from "./app";
import Base from "./base";
import OAuthClient from "./oauth-client";
import { JSONSchema, ValidationError } from "objection";

class AppConfig extends Base {
    static tableName: string = 'app_configs';

    static get idColumn() {
        return 'key';
    }

    static jsonSchema = { 
        type: 'object',
        required: ['key'],

        properties: {
            id: {
                type: 'string',
                format: 'uuid'
            },
            key: {
                type: 'string'
            },
            useOnlyPredefinedAuthClients: {
                type: 'boolean',
                default: false
            },
            disabled: {
                type: 'boolean',
                default: false
            },
            createdAt: { type: 'string'},
            updatedAt: { type: 'string'},
        },
    }

    static relationMappings = () => ({
        oauthClients: {
            relation: Base.HasManyRelation,
            modelClass: OAuthClient,
            join: {
                from: 'app_configs.key',
                to: 'oauth_clients.app_key',
            },
        },
    });

    async getApp() {
        //@ts-ignore
        if(!this.key) return null;
        //@ts-ignore
        return await App.findOneByKey(this.key);
    }
    //@ts-ignore
    async createOAuthClient(params) {
        const supportsOauthClients = (await this.getApp())?.auth?.generateAuthUrl
            ? true
            : false

        if (!supportsOauthClients) {
            throw new ValidationError({
                data: {
                    app: [
                        {
                            message: 'This app does not support OAuth clients!',
                        },
                    ],
                },
                type: 'ModelValidation',
            });
        }

        return await this.$relatedQuery('oauthClients').insert(params);
    }
}

export default AppConfig;