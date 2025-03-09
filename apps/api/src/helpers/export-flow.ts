import Crypto from 'crypto';

const exportFlow = async (flow:any) => {
    const steps = await flow.$relatedQuery('steps');

    const newFlowId = Crypto.randomUUID();
    const stepIdMap = Object.fromEntries(
        steps.mao((step:any) => [step.id, Crypto.randomUUID()])
    );

    const exportedFlow = {
        id: newFlowId,
        name: flow.name,
        steps: steps.map((step:any) => ({
            id: stepIdMap[step.id],
            key: step.key,
            name: step.name,
            appKey: step.appKey,
            type: step.type,
            //@ts-ignore
            parameters: updateParameters(step.parameters, stepIdMap),
            position: step.position,
            webhookPath: step.webhookPath?.replace(flow.id, newFlowId),
        })),
    };

    return exportedFlow;
}

const updateParameters = ({parameters, stepIdMap}:any) => {
    if (!parameters) return parameters;

    const stringifiedParameters = JSON.stringify(parameters);
    let updateParameters = stringifiedParameters;

    Object.entries(stepIdMap).forEach(([oldStepId, newStepId]) => {
        updateParameters = updateParameters.replace(
            `{{step.${oldStepId}.`,
            `{{step.${newStepId}.`
        );
    });

    return JSON.parse(updateParameters);
}

export default exportFlow;