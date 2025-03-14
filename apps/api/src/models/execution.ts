import { JSONSchema, QueryContext } from "objection";
import Base from "./base";
import Flow from "./flow";
import ExecutionStep from "./execution-step";
import Telemetry from "../helpers/telemetry";

class Execution extends Base {
    static tableName = 'executions';

    static jsonSchema = {
        type: 'object',

        properties: {
            id: { type: 'string', format: 'uuid' },
            flowId: { type: 'string', format: 'uuid' },
            testRun: { type: 'boolean', default: false },
            internalId: { type: 'string' },
            deletedAt: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        flow: {
            relation: Base.BelongsToOneRelation,
            modelClass: Flow,
            join: {
                from: 'executions.flow_id',
                to: 'flows.id',
            },
        },
        executionSteps: {
            relation: Base.HasManyRelation,
            modelClass: ExecutionStep,
            join: {
                from: 'executions.id',
                to: 'execution_step.execution_id',
            },
        },
    });

    async $afterInsert(queryContext: QueryContext): Promise<any> {
        await super.$afterInsert(queryContext);
        //@ts-ignore
        Telemetry.executionCreated(this);
    }
}

export default Execution;