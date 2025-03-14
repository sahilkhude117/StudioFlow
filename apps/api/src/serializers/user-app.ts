//@ts-ignore
const userAppSerializer = (userApp) => {
    let appData = {
      key: userApp.key,
      name: userApp.name,
      iconUrl: userApp.iconUrl,
      primaryColor: userApp.primaryColor,
      authDocUrl: userApp.authDocUrl,
      supportsConnections: userApp.supportsConnections,
    };
  
    if (userApp.connectionCount) {//@ts-ignore
      appData.connectionCount = userApp.connectionCount;
    }
  
    if (userApp.flowCount) {//@ts-ignore
      appData.flowCount = userApp.flowCount;
    }
  
    return appData;
};
  
export default userAppSerializer;
  