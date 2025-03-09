import { ValidationError } from "objection";
import Base from "./base";
import Step from "./step";
import User from "./user";
import Folder from "./folder";
import Execution from "./execution";
import ExecutionStep from "./execution-step";
import globalVariable from "../helpers/global-variable";
import logger from "../helpers/logger";
import Telemetry from "../helpers/telemetry";
import exportFlow from "../helpers/export-flow";
import flowQueue from "../queues/flow";
import {
    REMOVE_AFTER_30_DAYS_OR_150_JOBS,
    REMOVE_AFTER_7_DAYS_OR_50_JOBS,
} from '../helpers/remove-job-configuration.js';

const JOB_NAME = 'flow';
const EVERY_15_MINUTES_CRON = '*/15 * * * *';
  
class Flow extends Base {
    static tableName = 'flows';

    static jsonSchema = {
        type: 'object',
        required: ['name'],

        properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 1 },
            userId: { type: 'string', format: 'uuid' },
            folderId: { type: ['string', 'null'], format: 'uuid' },
            remoteWebhookId: { type: 'string' },
            active: { type: 'boolean' },
            publishedAt: { type: 'string' },
            deletedAt: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        steps: {
            relation: Base.HasManyRelation,
            modelClass: Step,
            join: {
                from: 'flows.id',
                to: 'steps.flow_id',
            },
            filter(builder:any) {
                builder.orderBy('position', 'asc')
            },
        },
        triggerStep: {
            relation: Base.HasOneRelation,
            modelClass: Step,
            join: {
                from: 'flows.id',
                to: 'steps.flow_id',
            },
            filter(builder:any) {
                builder.where('type', 'trigger').limit(1).first();
            },
        },
        executions: {
            relation: Base.HasManyRelation,
            modelClass: Execution,
            join: {
                from: 'flows.id',
                to: 'executions.flow_id',
            },
        },
        lastExecution: {
            relation: Base.HasOneRelation,
            modelClass: Execution,
            join: {
                from: 'flows.id',
                to: 'executions.flow_id',
            },
            filter(builder:any) {
                builder.orderBy('created_at', 'desc').limit(1).first();
            },
        },
        user: {
            relation: Base.HasOneRelation,
            modelClass: User,
            join: {
              from: 'flows.user_id',
              to: 'users.id',
            },
        },
        folder: {
            relation: Base.HasOneRelation,
            modelClass: Folder,
            join: {
              from: 'flows.folder_id',
              to: 'folders.id',
            },
        },
    });

    static async populateStatusProperty(flows:any) {
        const referenceFlow = flows[0];
    
        if (referenceFlow) {
          const shouldBePaused = await referenceFlow.isPaused();
    
          for (const flow of flows) {
            if (!flow.active) {
              flow.status = 'draft';
            } else if (flow.active && shouldBePaused) {
              flow.status = 'paused';
            } else {
              flow.status = 'published';
            }
          }
        }
    }
    //@ts-ignore
    static async afterFind(args) {
        await this.populateStatusProperty(args.result);
    }
    
    async lastInternalId() {
        const lastExecution = await this.$relatedQuery('lastExecution');
        //@ts-ignore
        return lastExecution ? lastExecution.internalId : null;
    }
    
    async lastInternalIds(itemCount = 50) {
        const lastExecutions = await this.$relatedQuery('executions')
          .select('internal_id')
          .orderBy('created_at', 'desc')
          .limit(itemCount);
        //@ts-ignore
        return lastExecutions.map((execution) => execution.internalId);
    }

    static get IncompleteStepsError() {
        return new ValidationError({
          data: {
            flow: [
              {
                message:
                  'All steps should be completed before updating flow status!',
              },
            ],
          },
          type: 'incompleteStepsError',
        });
    }

    async createInitialSteps() {
        //@ts-ignore
        await Step.query().insert({
            //@ts-ignore
            flowId: this.id,
            type: 'trigger',
            position: 1,
          });
    
        await Step.query().insert({
        //@ts-ignore
          flowId: this.id,
          type: 'action',
          position: 2,
        });
    }

    async getStepById(stepId:any) {
        return await this.$relatedQuery('steps').findById(stepId).throwIfNotFound();
    }    

    async insertActionStepAtPosition(position:any) {
        return await this.$relatedQuery('steps').insertAndFetch({
          type: 'action',
          position,
        });
    }

    async getStepsAfterPosition(position:any) {
        return await this.$relatedQuery('steps').where('position', '>', position);
    }
    //@ts-ignore
    async updateStepPositionsFrom(startPosition, steps) {
        //@ts-ignore
        const stepPositionUpdates = steps.map(async (step, index) => {
          return await step.$query().patch({
            position: startPosition + index,
          });
        });
    
        return await Promise.all(stepPositionUpdates);
    }
    //@ts-ignore
    async createStepAfter(previousStepId) {
        const previousStep = await this.getStepById(previousStepId);
        //@ts-ignore
        const nextSteps = await this.getStepsAfterPosition(previousStep.position);
    
        const createdStep = await this.insertActionStepAtPosition(
            //@ts-ignore
          previousStep.position + 1
        );
    //@ts-ignore
        await this.updateStepPositionsFrom(createdStep.position + 1, nextSteps);
    
        return createdStep;
    }

    async unregisterWebhook() {
    //@ts-ignore
        const triggerStep = await this.getTriggerStep();
        //@ts-ignore
        const trigger = await triggerStep?.getTriggerCommand();
    
        if (trigger?.type === 'webhook' && trigger.unregisterHook) {
          const $ = await globalVariable({
            flow: this,
            //@ts-ignore
            connection: await triggerStep.$relatedQuery('connection'),
            //@ts-ignore
            app: await triggerStep.getApp(),
            step: triggerStep,
          });
    
          try {
            await trigger.unregisterHook($);
          } catch (error) {
            // suppress error as the remote resource might have been already deleted
            logger.debug(
                //@ts-ignore
              `Failed to unregister webhook for flow ${this.id}: ${error.message}`
            );
          }
        }
    }

    async deleteExecutionSteps() {
        const executionIds = (
          await this.$relatedQuery('executions').select('executions.id')
          //@ts-ignore
        ).map((execution) => execution.id);
    
        return await ExecutionStep.query()
          .delete()
          .whereIn('execution_id', executionIds);
    }

    async deleteExecutions() {
        return await this.$relatedQuery('executions').delete();
    }
    
    async deleteSteps() {
        return await this.$relatedQuery('steps').delete();
    }
    
    async delete() {
        await this.unregisterWebhook();

        await this.deleteExecutionSteps();
        await this.deleteExecutions();
        await this.deleteSteps();

        await this.$query().delete();
    }
    //@ts-ignore
    async duplicateFor(user) {
        const steps = await this.$relatedQuery('steps').orderBy(
          'steps.position',
          'asc'
        );
    
        const duplicatedFlow = await user.$relatedQuery('flows').insertAndFetch({
            //@ts-ignore
          name: `Copy of ${this.name}`,
          active: false,
        });
        //@ts-ignore
        const updateStepId = (value, newStepIds) => {
          let newValue = value;
    
          const stepIdEntries = Object.entries(newStepIds);
          for (const stepIdEntry of stepIdEntries) {
            const [oldStepId, newStepId] = stepIdEntry;
    
            const partialOldVariable = `{{step.${oldStepId}.`;
            const partialNewVariable = `{{step.${newStepId}.`;
    
            newValue = newValue.replaceAll(partialOldVariable, partialNewVariable);
          }
    
          return newValue;
        };
        //@ts-ignore
        const updateStepVariables = (parameters, newStepIds) => {
          const entries = Object.entries(parameters);
            //@ts-ignore
          return entries.reduce((result, [key, value]) => {
            if (typeof value === 'string') {
              return {
                ...result,
                [key]: updateStepId(value, newStepIds),
              };
            }
    
            if (Array.isArray(value)) {
              return {
                ...result,
                //@ts-ignore
                [key]: value.map((item) => updateStepVariables(item, newStepIds)),
              };
            }
    
            return {
              ...result,
              [key]: value,
            };
          }, {});
        };
    
        const newStepIds = {};
        for (const step of steps) {
          const duplicatedStep = await duplicatedFlow
            .$relatedQuery('steps')
            .insert({
                //@ts-ignore
              key: step.key,
              //@ts-ignore
              name: step.name,
              //@ts-ignore
              appKey: step.appKey,
              //@ts-ignore
              type: step.type,
              //@ts-ignore
              connectionId: step.connectionId,
              //@ts-ignore
              position: step.position,
              //@ts-ignore
              parameters: updateStepVariables(step.parameters, newStepIds),
            });
    
          if (duplicatedStep.isTrigger) {
            await duplicatedStep.updateWebhookUrl();
          }
          //@ts-ignore
          newStepIds[step.id] = duplicatedStep.id;
        }
    
        const duplicatedFlowWithSteps = duplicatedFlow
          .$query()
          .withGraphJoined({ steps: true })
          .orderBy('steps.position', 'asc')
          .throwIfNotFound();
    
        return duplicatedFlowWithSteps;
    }
    
    async getTriggerStep() {
        return await this.$relatedQuery('steps').findOne({
          type: 'trigger',
        });
    }

    async isPaused() {
        //@ts-ignore
        const user = await this.$relatedQuery('user').withSoftDeleted();
        const allowedToRunFlows = await user.isAllowedToRunFlows();
        return allowedToRunFlows ? false : true;
    }
    //@ts-ignore
    async updateFolder(folderId) {
        const user = await this.$relatedQuery('user');
    
        if (folderId === null) {
          return this.updateFolderReference(null);
        }
    
        const folder = await user
        //@ts-ignore
          .$relatedQuery('folders')
          .findOne({ id: folderId })
          .throwIfNotFound();
    
        return this.updateFolderReference(folder.id);
    }
    //@ts-ignore
    async updateFolderReference(folderId) {
        await this.$query().patch({ folderId });
        return this.$query().withGraphFetched('folder');
    }
//@ts-ignore
    async updateStatus(newActiveValue) {
        //@ts-ignore
        if (this.active === newActiveValue) {
          return this;
        }
    
        const triggerStep = await this.getTriggerStep();
        //@ts-ignore
        if (triggerStep.status === 'incomplete') {
          throw Flow.IncompleteStepsError;
        }
        //@ts-ignore
        const trigger = await triggerStep.getTriggerCommand();
        //@ts-ignore
        const interval = trigger.getInterval?.(triggerStep.parameters);
        const repeatOptions = {
          pattern: interval || EVERY_15_MINUTES_CRON,
        };
    
        if (trigger.type === 'webhook') {
          const $ = await globalVariable({
            flow: this,
            //@ts-ignore
            connection: await triggerStep.$relatedQuery('connection'),
            //@ts-ignore
            app: await triggerStep.getApp(),
            step: triggerStep,
            testRun: false,
          });
    
          if (newActiveValue && trigger.registerHook) {
            await trigger.registerHook($);
          } else if (!newActiveValue && trigger.unregisterHook) {
            await trigger.unregisterHook($);
          }
        } else {
          if (newActiveValue) {
            await this.$query().patchAndFetch({
              publishedAt: new Date().toISOString(),
            });
            //@ts-ignore
            const jobName = `${JOB_NAME}-${this.id}`;
    
            await flowQueue.add(
              jobName,
              //@ts-ignore
              { flowId: this.id },
              {
                repeat: repeatOptions,
                //@ts-ignore
                jobId: this.id,
                removeOnComplete: REMOVE_AFTER_7_DAYS_OR_50_JOBS,
                removeOnFail: REMOVE_AFTER_30_DAYS_OR_150_JOBS,
              }
            );
          } else {
            const repeatableJobs = await flowQueue.getRepeatableJobs();
            //@ts-ignore
            const job = repeatableJobs.find((job) => job.id === this.id);
            //@ts-ignore
            await flowQueue.removeRepeatableByKey(job.key);
          }
        }
    
        return await this.$query().withGraphFetched('steps').patchAndFetch({
          active: newActiveValue,
        });
    }

    async throwIfHavingIncompleteSteps() {
        const incompleteStep = await this.$relatedQuery('steps').findOne({
          status: 'incomplete',
        });
    
        if (incompleteStep) {
          throw Flow.IncompleteStepsError;
        }
    }

    async throwIfHavingLessThanTwoSteps() {
        const allSteps = await this.$relatedQuery('steps');
    
        if (allSteps.length < 2) {
          throw new ValidationError({
            data: {
              flow: [
                {
                  message:
                    'There should be at least one trigger and one action steps in the flow!',
                },
              ],
            },
            type: 'insufficientStepsError',
          });
        }
    }

    async export() {
        return await exportFlow(this);
    }

    //@ts-ignore
    async $beforeUpdate(opt, queryContext) {
        await super.$beforeUpdate(opt, queryContext);
        //@ts-ignore
        if (this.active) {
          await opt.old.throwIfHavingIncompleteSteps();
    
          await opt.old.throwIfHavingLessThanTwoSteps();
        }
    }
    //@ts-ignore
    async $afterInsert(queryContext) {
        await super.$afterInsert(queryContext);
    
        Telemetry.flowCreated(this);
    }
    //@ts-ignore
    async $afterUpdate(opt, queryContext) {
        await super.$afterUpdate(opt, queryContext);
    
        Telemetry.flowUpdated(this);
    }
}

export default Flow;