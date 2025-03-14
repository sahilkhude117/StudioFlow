import flowSerializer from "./flow";
//@ts-ignore
const executionSerializer = (execution) => {
  let executionData = {
    id: execution.id,
    testRun: execution.testRun,
    createdAt: execution.createdAt.getTime(),
    updatedAt: execution.updatedAt.getTime(),
  };

  if (execution.status) {
    //@ts-ignore
    executionData.status = execution.status;
  }

  if (execution.flow) {
    //@ts-ignore
    executionData.flow = flowSerializer(execution.flow);
  }

  return executionData;
};

export default executionSerializer;
