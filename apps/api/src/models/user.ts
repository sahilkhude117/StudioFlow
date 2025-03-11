import bcrypt from 'bcrypt'; 
import { DateTime, Duration } from 'luxon';
import crypto from 'node:crypto';
import { ValidationError } from 'objection';

import appConfig from '../config/app';
import { hasValidLicense } from '../helpers/license.ee';
import userAbility from '../helpers/user-ability';
import createAuthTokenByUserId from '../helpers/create-auth-token-by-user-id';
import Base from './base';
import App from './app';
import AccessToken from './access-token';
import Connection from './connection';
import Config from './config';
import Execution from './execution';
import ExecutionStep from './execution-step';
import Flow from './flow';
import Identity from './identity.ee';
import Permission from './permission';
import Role from './role';
import Step from './step';
import Subscription from './subscription.ee';
import Folder from './folder';
import UsageData from './usage-data';
import Billing from '../helpers/billing/index.ee';
import NotAuthorized from '../errors/not-authorized';

import deleteUserQueue from '../queues/delete-user.ee';
import flowQueue from '../queues/flow';
import emailQueue from '../queues/email';
import {
    REMOVE_AFTER_30_DAYS_OR_150_JOBS,
    REMOVE_AFTER_7_DAYS_OR_50_JOBS,
} from '../helpers/remove-job-configuration.js';
  

class User extends Base {
    static tableName = 'users';

    static jsonSchema = {
        type: 'object',
        required: ['fullName', 'email'],

        properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email', minLenth: 1, maxLength: 255 },
            password: { type: 'string', minLength: 6 },
            status: {
                type: 'string',
                enum: ['active', 'invited'],
                default: 'active',
            },
            resetPasswordToken: { type: ['string', 'null'] },
            resetPasswordTokenSentAt: {
                type: ['string', 'null'],
                format: 'date-time',
            },
            invitationToken: { type: ['string', 'null']},
            invitationTokenSentAt: {
                type: ['string', 'null'],
                format: 'date-time',
            },
            trialExpiryData: { type: 'string' },
            roleId: { type: 'string', format: 'uuid' },
            deletedAt: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        accessTokens: {
            relation: Base.HasManyRelation,
            modelClass: AccessToken,
            join: {
                from: 'users.id',
                to: 'access_tokens.user_id',
            },
        },
        connections: {
            relation: Base.HasManyRelation,
            modelClass: Connection,
            join: {
                from: 'users.id',
                to: 'connections.user_id',
            },
        },
        flows: {
            relation: Base.HasManyRelation,
            modelClass: Flow,
            join: {
                from: 'users.id',
                to: 'flows.user_id',
            },
        },
        steps: {
            relation: Base.ManyToManyRelation,
            modelClass: Step,
            join: {
                from: 'users.id',
                through: {
                    from: 'flows.user_id',
                    to: 'flows.id',
                },
                to: 'steps.flow_id',
            },
        },
        executions: {
            relation: Base.ManyToManyRelation,
            modelClass: Execution,
            join: {
                from: 'users.id',
                through: {
                    from: 'flows.user_id',
                    to: 'flows.id',
                },
                to: 'executions.flow_id',
            },
        },
        usageData: {
            relation: Base.HasManyRelation,
            modelClass: UsageData,
            join: {
                from: 'usage_data.user_id',
                to: 'users.id',
            },
        },
        currentUsageData: {
            relation: Base.HasOneRelation,
            modelClass: UsageData,
            join: {
                from: 'usage_data.user_id',
                to: 'users.id',
            },
            //@ts-ignore
            filter(builder){
                builder.orderBy('created_at', 'desc').limit(1).first();
            },
        },
        subscriptions: {
            relation: Base.HasManyRelation,
            modelClass: Subscription,
            join: {
                from: 'subscriptions.user_id',
                to: 'users.id',
            },
        },
        currentSubscription: {
            relation: Base.HasOneRelation,
            modelClass: Subscription,
            join: {
                from: 'subscriptions.user_id',
                to: 'users.id',
            },
            //@ts-ignore
            filter(builder){
                builder.orderBy('created_at', 'desc').limit(1).first();
            },
        },
        role: {
            relation: Base.HasOneRelation,
            modelClass: Role,
            join: {
                from: 'roles.id',
                to: 'users.role_id',
            },
        },
        permissions: {
            relation: Base.HasManyRelation,
            modelClass: Permission,
            join: {
                from: 'users.role_id',
                to: 'permissions.role_id',
            },
        },
        identities: {
            relation: Base.HasManyRelation,
            modelClass: Identity,
            join: {
                from: 'identities.user_id',
                to: 'users.id',
            },
        },
        folders: {
            relation: Base.HasManyRelation,
            modelClass: Folder,
            join: {
                from: 'users.id',
                to: 'folders.user_id',
            },
        },
    });

    static get virtualAttributes() {
        return ['acceptInvitationUrl'];
    }

    get authorizedFlows() {
        //@ts-ignore
        const conditions = this.can('read', 'Flow');
        return conditions.isCreator ? this.$relatedQuery('flows') : Flow.query();
    }

    get authorizedSteps() {
        const conditions = this.can('read', 'Flow');
        return conditions.isCreator ? this.$relatedQuery('steps') : Step.query();
    }

    get authorizedConnections() {
        const conditions = this.can('read', 'Connection');
        return conditions.isCreator
          ? this.$relatedQuery('connections')
          : Connection.query();
    }

    get authorizedExecutions() {
        const conditions = this.can('read', 'Execution');
        return conditions.isCreator
          ? this.$relatedQuery('executions')
          : Execution.query();
    }

    get acceptInvitationUrl() {
        //@ts-ignore
        return `${appConfig.webAppUrl}/accept-invitation?token=${this.invitationToken}`;
    }

    get ability() {
        return userAbility(this);
    }
    //@ts-ignore
    static async authenticate(email, password) {
        const user = await User.query().findOne({
          email: email?.toLowerCase() || null,
        });
    
        if (user && (await user.login(password))) {
            //@ts-ignore
          const token = await createAuthTokenByUserId(user.id);
          return token;
        }
    }
    //@ts-ignore
    async login(password) {
        //@ts-ignore
        return await bcrypt.compare(password, this.password);
    }

    async generateResetPasswordToken() {
        const resetPasswordToken = crypto.randomBytes(64).toString('hex');
        const resetPasswordTokenSentAt = new Date().toISOString();
        //@ts-ignore
        await this.$query().patch({ resetPasswordToken, resetPasswordTokenSentAt });
    }

    async generateInvitationToken() {
        const invitationToken = crypto.randomBytes(64).toString('hex');
        const invitationTokenSentAt = new Date().toISOString();
    
        await this.$query().patchAndFetch({
            //@ts-ignore
          invitationToken,
          invitationTokenSentAt,
        });
    }
    //@ts-ignore
    async resetPassword(password) {
        return await this.$query().patch({
            //@ts-ignore
          resetPasswordToken: null,
          resetPasswordTokenSentAt: null,
          password,
        });
    }
    //@ts-ignore
    async acceptInvitation(password) {
        return await this.$query().patch({
            //@ts-ignore
          invitationToken: null,
          invitationTokenSentAt: null,
          status: 'active',
          password,
        });
    }
    //@ts-ignore
    async updatePassword({ currentPassword, password }) {
        //@ts-ignore
        if (await User.authenticate(this.email, currentPassword)) {
          const user = await this.$query().patchAndFetch({
            //@ts-ignore
            password,
          });
    
          return user;
        }
    
        throw new ValidationError({
          data: {
            currentPassword: [
              {
                message: 'is incorrect.',
              },
            ],
          },
          type: 'ValidationError',
        });
    }

    async softRemove() {
        await this.softRemoveAssociations();
        await this.$query().delete();
        //@ts-ignore
        const jobName = `Delete user - ${this.id}`;
        //@ts-ignore
        const jobPayload = { id: this.id };
        const millisecondsFor30Days = Duration.fromObject({ days: 30 }).toMillis();
        const jobOptions = {
          delay: millisecondsFor30Days,
        };
    
        await deleteUserQueue.add(jobName, jobPayload, jobOptions);
    }

    async softRemoveAssociations() {
        const flows = await this.$relatedQuery('flows').where({
          active: true,
        });
    
        const repeatableJobs = await flowQueue.getRepeatableJobs();
    
        for (const flow of flows) {//@ts-ignore
          const job = repeatableJobs.find((job) => job.id === flow.id);
    
          if (job) {
            await flowQueue.removeRepeatableByKey(job.key);
          }
        }
    
        const executionIds = (
          await this.$relatedQuery('executions').select('executions.id')//@ts-ignore
        ).map((execution) => execution.id);//@ts-ignore
        const flowIds = flows.map((flow) => flow.id);
    
        await this.$relatedQuery('accessTokens').delete();
        await ExecutionStep.query().delete().whereIn('execution_id', executionIds);
        await this.$relatedQuery('executions').delete();
        await this.$relatedQuery('steps').delete();
        await Flow.query().whereIn('id', flowIds).delete();
        await this.$relatedQuery('connections').delete();
        await this.$relatedQuery('identities').delete();
    
        if (appConfig.isCloud) {
          await this.$relatedQuery('subscriptions').delete();
          await this.$relatedQuery('usageData').delete();
        }
    }
    
    async sendResetPasswordEmail() {
        await this.generateResetPasswordToken();
        //@ts-ignore
        const jobName = `Reset Password Email - ${this.id}`;
    
        const jobPayload = {//@ts-ignore
          email: this.email,
          subject: 'Reset Password',
          template: 'reset-password-instructions.ee',
          params: {//@ts-ignore
            token: this.resetPasswordToken,
            webAppUrl: appConfig.webAppUrl,//@ts-ignore
            fullName: this.fullName,
          },
        };
    
        const jobOptions = {
          removeOnComplete: REMOVE_AFTER_7_DAYS_OR_50_JOBS,
          removeOnFail: REMOVE_AFTER_30_DAYS_OR_150_JOBS,
        };
    
        await emailQueue.add(jobName, jobPayload, jobOptions);
    }

    isResetPasswordTokenValid() {//@ts-ignore
        if (!this.resetPasswordTokenSentAt) {
          return false;
        }
    //@ts-ignore
        const sentAt = new Date(this.resetPasswordTokenSentAt);
        const now = new Date();
        const fourHoursInMilliseconds = 1000 * 60 * 60 * 4;
    
        return now.getTime() - sentAt.getTime() < fourHoursInMilliseconds;
      }
    
      async sendInvitationEmail() {
        await this.generateInvitationToken();
    //@ts-ignore
        const jobName = `Invitation Email - ${this.id}`;
    
        const jobPayload = {//@ts-ignore
          email: this.email,
          subject: 'You are invited!',
          template: 'invitation-instructions',
          params: {//@ts-ignore
            fullName: this.fullName,
            acceptInvitationUrl: this.acceptInvitationUrl,
          },
        };
    
        const jobOptions = {
          removeOnComplete: REMOVE_AFTER_7_DAYS_OR_50_JOBS,
          removeOnFail: REMOVE_AFTER_30_DAYS_OR_150_JOBS,
        };
    
        await emailQueue.add(jobName, jobPayload, jobOptions);
    }

    isInvitationTokenValid() {//@ts-ignore
        if (!this.invitationTokenSentAt) {
          return false;
        }
    //@ts-ignore
        const sentAt = new Date(this.invitationTokenSentAt);
        const now = new Date();
        const seventyTwoHoursInMilliseconds = 1000 * 60 * 60 * 72;
    
        return now.getTime() - sentAt.getTime() < seventyTwoHoursInMilliseconds;
    }

    async generateHash() {//@ts-ignore
        if (this.password) {//@ts-ignore
          this.password = await bcrypt.hash(this.password, 10);
        }
    }

    startTrialPeriod() {//@ts-ignore
        this.trialExpiryDate = DateTime.now().plus({ days: 30 }).toISODate();
    }

    async isAllowedToRunFlows() {
        if (appConfig.isSelfHosted) {
          return true;
        }
    
        if (await this.inTrial()) {
          return true;
        }
    
        if ((await this.hasActiveSubscription()) && (await this.withinLimits())) {
          return true;
        }
    
        return false;
    }

    async inTrial() {
        if (appConfig.isSelfHosted) {
          return false;
        }
    //@ts-ignore
        if (!this.trialExpiryDate) {
          return false;
        }
    
        if (await this.hasActiveSubscription()) {
          return false;
        }
    //@ts-ignore
        const expiryDate = DateTime.fromJSDate(this.trialExpiryDate);
        const now = DateTime.now();
    
        return now < expiryDate;
    }

    async hasActiveSubscription() {
        if (!appConfig.isCloud) {
          return false;
        }
    
        const subscription = await this.$relatedQuery('currentSubscription');
    //@ts-ignore
        return subscription?.isValid;
    }

    async withinLimits() {
        const currentSubscription = await this.$relatedQuery('currentSubscription');//@ts-ignore
        const plan = currentSubscription.plan;
        const currentUsageData = await this.$relatedQuery('currentUsageData');
    //@ts-ignore
        return currentUsageData.consumedTaskCount < plan.quota;
    }

    async getPlanAndUsage() {
        const usageData = await this.$relatedQuery(
          'currentUsageData'
        ).throwIfNotFound();
    
        const subscription = await this.$relatedQuery('currentSubscription');
    
        const currentPlan = Billing.paddlePlans.find(//@ts-ignore
          (plan) => plan.productId === subscription?.paddlePlanId
        );
    
        const planAndUsage = {
          usage: {//@ts-ignore
            task: usageData.consumedTaskCount,
          },
          plan: {//@ts-ignore
            id: subscription?.paddlePlanId || null,//@ts-ignore
            name: subscription ? currentPlan.name : 'Free Trial',
            limit: currentPlan?.limit || null,
          },
        };
    
        return planAndUsage;
    }

    async getInvoices() {
        const subscription = await this.$relatedQuery('currentSubscription');
    
        if (!subscription) {
          return [];
        }
    
        const invoices = await Billing.paddleClient.getInvoices(//@ts-ignore
          Number(subscription.paddleSubscriptionId)
        );
    
        return invoices;
    }
//@ts-ignore
    async hasFolderAccess(folderId) {
        if (folderId && folderId !== 'null') {
          await this.$relatedQuery('folders').findById(folderId).throwIfNotFound();
        }
    
        return true;
    }
//@ts-ignore
    getFlows({ folderId, name}) {
        return this.authorizedFlows
            .clone()
            .withGraphFetched({
                steps: true,
            })
            .where((builder) => {
                if (name) {
                    builder.where('flows.name', 'ilike', `%${name}%`);
                }

                if (folderId === 'null') {
                    builder.whereNull('flows.folder_id');
                } else if (folderId) {
                    builder.where('flows.folder_id', folderId);
                }
            })
            .orderBy('active', 'desc')
            .orderBy('updated_at', 'desc');
    }
//@ts-ignore
    async getApps(name) {
        const connections = await this.authorizedConnections
            .clone()
            .select('connections.key')
            .where({ draft: false })
            .count('connections.id as count')
            .groupBy('connections.key');

        const flows = await this.authorizedFlows
            .clone()
            .withGraphJoined('steps')
            .orderBy('created_at','desc');

            const duplicatedUsedApps = flows//@ts-ignore
            .map((flow) => flow.steps.map((step) => step.appKey))
            .flat()
            .filter(Boolean);
      //@ts-ignore
        const connectionKeys = connections.map((connection) => connection.key);//@ts-ignore
        const usedApps = [...new Set([...duplicatedUsedApps, ...connectionKeys])];
    
        let apps = await App.findAll(name);

        apps = apps
            .filter((app) => {
                return usedApps.includes(app.key);
            })
            .map((app) => {
                const connection = connections.find(//@ts-ignore
                    (connection) => connection.key === app.key
                );
//@ts-ignore
                app.connectionCount = connection?.count || 0;
                app.flowCount = 0;

                flows.forEach((flow) => {//@ts-ignore
                    const usedFlow = flow.steps.find((step) => step.appKey === app.key);
                    //@ts-ignore
                    if (usedFlow) {
                        app.flowCount += 1;
                    }
                });

                return app;
            })
            .sort((appA, appB) => appA.name.localeCompare(appB.name));

        return apps;
    }
//@ts-ignore
    static async createAdmin({ email, password, fullName }) {
        const adminRole = await Role.findAdmin();
    //@ts-ignore
        const adminUser = await this.query().insert({//@ts-ignore
          email,
          password,
          fullName,//@ts-ignore
          roleId: adminRole.id,
        });
    
        await Config.markInstallationCompleted();
    
        return adminUser;
    }
//@ts-ignore
    static async registerUser(userData) {
        const { fullName, email, password } = userData;
    
        const role = await Role.query().findOne({ name: 'User' }).throwIfNotFound();
    
        const user = await User.query().insertAndFetch({//@ts-ignore
          fullName,
          email,
          password,//@ts-ignore
          roleId: role.id,
        });
    
        return user;
    }
//@ts-ignore
    can(action, subject) {
        const can = this.ability.can(action, subject);
    //@ts-ignore
        if (!can) throw new NotAuthorizedError('The user is not authorized!');
    
        const relevantRule = this.ability.relevantRuleFor(action, subject);
    
        const conditions = relevantRule?.conditions || [];
        const conditionMap = Object.fromEntries(//@ts-ignore
          conditions.map((condition) => [condition, true])
        );
    
        return conditionMap;
    }

    lowercaseEmail() {//@ts-ignore
        if (this.email) {//@ts-ignore
          this.email = this.email.toLowerCase();
        }
    }

    async createUsageData() {
        if (appConfig.isCloud) {
          return await this.$relatedQuery('usageData').insertAndFetch({//@ts-ignore
            userId: this.id,
            consumedTaskCount: 0,
            nextResetAt: DateTime.now().plus({ days: 30 }).toISODate(),
          });
        }
    }

    async omitEnterprisePermissionsWithoutValidLicense() {
        if (await hasValidLicense()) {
          return this;
        }
    //@ts-ignore
        if (Array.isArray(this.permissions)) {//@ts-ignore
          this.permissions = this.permissions.filter((permission) => {
            const restrictedSubjects = [
              'App',
              'Role',
              'SamlAuthProvider',
              'Config',
            ];
    
            return !restrictedSubjects.includes(permission.subject);
          });
        }
    }
//@ts-ignore
    async $beforeInsert(queryContext) {
        await super.$beforeInsert(queryContext);
    
        this.lowercaseEmail();
        await this.generateHash();
    
        if (appConfig.isCloud) {
          this.startTrialPeriod();
        }
    }
//@ts-ignore
    async $beforeUpdate(opt, queryContext) {
        await super.$beforeUpdate(opt, queryContext);
    
        this.lowercaseEmail();
    
        await this.generateHash();
    }
    //@ts-ignore
    async $afterInsert(queryContext) {
        await super.$afterInsert(queryContext);
    
        await this.createUsageData();
    }
    
    async $afterFind() {
        await this.omitEnterprisePermissionsWithoutValidLicense();
    }
}

export default User;