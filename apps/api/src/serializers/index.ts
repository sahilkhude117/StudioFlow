import userSerializer from "./user";
import roleSerializer from "./role";
import permissionSerializer from "./permission";
import adminSamlAuthProviderSerializer from "./admin-saml-auth-provider.ee";    
import adminTemplateSerializer from "./admin/template.ee";
import samlAuthProviderSerializer from "./saml-auth-provider.ee";
import samlAuthProviderRoleMappingSerializer from './role-mapping.ee.js';
import oauthClientSerializer from "./oauth-client";
import appConfigSerializer from "./app-config";
import flowSerializer from "./flow";
import stepSerializer from "./step";
import connectionSerializer from "./connection";
import appSerializer from "./app";
import userAppSerializer from "./user-app";
import authSerializer from "./auth";
import triggerSerializer from "./trigger";
import actionSerializer from "./action";
import executionSerializer from "./execution";
import executionStepSerializer from "./execution-step";
import subscriptionSerializer from "./subscription.ee";
import adminUserSerializer from "./admin/user";
import configSerializer from "./config";
import folderSerializer from "./folder";

const serializers = {
    AdminUser: adminUserSerializer,
    User: userSerializer,
    Role: roleSerializer,
    Permission: permissionSerializer,
    AdminSamlAuthProvider: adminSamlAuthProviderSerializer,
    AdminTemplate: adminTemplateSerializer,
    SamlAuthProvider: samlAuthProviderSerializer,
    RoleMapping: samlAuthProviderRoleMappingSerializer,
    OAuthClient: oauthClientSerializer,
    AppConfig: appConfigSerializer,
    Flow: flowSerializer,
    Step: stepSerializer,
    Connection: connectionSerializer,
    App: appSerializer,
    UserApp: userAppSerializer,
    Auth: authSerializer,
    Trigger: triggerSerializer,
    Action: actionSerializer,
    Execution: executionSerializer,
    ExecutionStep: executionStepSerializer,
    Subscription: subscriptionSerializer,
    Config: configSerializer,
    Folder: folderSerializer,
};
  
export default serializers;