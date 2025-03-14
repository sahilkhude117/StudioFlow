import executionStepSerializer from "./execution-step";
//@ts-ignore
const stepSerializer = (step) => {
    let stepData = {
      id: step.id,
      type: step.type,
      key: step.key,
      name: step.name,
      appKey: step.appKey,
      iconUrl: step.iconUrl,
      webhookUrl: step.webhookUrl,
      status: step.status,
      position: step.position,
      parameters: step.parameters,
    };
  
    if (step.lastExecutionStep) {
        //@ts-ignore
      stepData.lastExecutionStep = executionStepSerializer(
        step.lastExecutionStep
      );
    }
  
    if (step.executionSteps?.length > 0) {
        //@ts-ignore
      stepData.executionSteps = step.executionSteps.map((executionStep) =>
        executionStepSerializer(executionStep)
      );
    }
  
    return stepData;
};
  
export default stepSerializer;
  