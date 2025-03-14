import stepSerializer from "./step";
import folderSerilializer from "./folder";
//@ts-ignore
const flowSerializer = (flow) => {
    let flowData = {
      id: flow.id,
      name: flow.name,
      active: flow.active,
      status: flow.status,
      createdAt: flow.createdAt.getTime(),
      updatedAt: flow.updatedAt.getTime(),
    };
  
    if (flow.steps?.length > 0) {
        //@ts-ignore
      flowData.steps = flow.steps.map((step) => stepSerializer(step));
    }
  
    if (flow.folder) {
        //@ts-ignore
      flowData.folder = folderSerilializer(flow.folder);
    }
  
    return flowData;
};
  
export default flowSerializer;
  