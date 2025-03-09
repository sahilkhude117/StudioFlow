import appConfig from "../config/app";
import Base from "./base";
import Execution from "./execution";
import Step from "./step";
import Telemetry from "../helpers/telemetry";
import { QueryContext } from "objection";

class ExecutionStep extends Base {
    static tableName = 'execution_steps';

    static jsonSchema = {
        type: 'object',

        properties: {
            id: { type: 'string', format: 'uuid' },
            executionId: { type: 'string', format: 'uuid' },
            stepId: { type: 'string' },
            dataIn: { type: ['object', 'null'] },
            dataOut: { type: ['object', 'null'] },
            status: { type: 'string', enum: ['success', 'failure'] },
            errorDetails: { type: ['object', 'null'] },
            deletedAt: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        execution: {
            relation: Base.BelongsToOneRelation,
            modelClass: Execution,
            join: {
                from: 'execution_steps.execution_id',
                to: 'executions.id',
            },
        },
        step: {
            relation: Base.BelongsToOneRelation,
            modelClass: Step,
            join: {
                from: 'execution_steps.step_id',
                to: 'steps.id',
            },
        },
    });

    get isFailed() {
        //@ts-ignore
        return this.status === 'failure';
    }

    async isSucceededNonTestRun() {
        const execution = await this.$relatedQuery('execution');
        //@ts-ignore
        return !execution.testRun && !this.isFailed;
    }

    async updateUsageData() {
        const execution = await this.$relatedQuery('execution');
        //@ts-ignore
        const flow = await execution.$relatedQuery('flow');
        const user = await flow.$relatedQuery('user');
        const usageData = await user.$relatedQuery('currentUsageData');

        await usageData.increaseConsumedTaskCountByOne();
    }

    async increaseUsageCount() {
        //@ts-ignore
        if (appConfig.isCloud && this.isSucceededNonTestRun()) {
          await this.updateUsageData();
        }
    }

    async $afterInsert(queryContext: QueryContext): Promise<any>  {
        await super.$afterInsert(queryContext);
        Telemetry.executionStepCreated(this);
        await this.increaseUsageCount();
    }
}

export default ExecutionStep;