import path, { join } from 'path';
import fs from 'node:fs';
import omit from 'lodash/omit.js';
import cloneDeep from 'lodash/cloneDeep.js';
import addAuthenticationSteps from './add-authentication-steps.js';
import addReconnectionSteps from './add-reconnection-steps.js';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apps = fs
  .readdirSync(path.resolve(__dirname, `../apps/`), { withFileTypes: true })
  .reduce((apps, dirent) => {
    if (!dirent.isDirectory()) return apps;
    //@ts-ignore
    apps[dirent.name] = import(
    //@ts-ignore
      pathToFileURL(join(__dirname, '../apps', dirent.name, 'index.js'))
    );

    return apps;
  }, {});
//@ts-ignore
async function getAppDefaultExport(appKey) {
  if (!Object.prototype.hasOwnProperty.call(apps, appKey)) {
    throw new Error(
      `An application with the "${appKey}" key couldn't be found.`
    );
  }
//@ts-ignore
  return (await apps[appKey]).default;
}
//@ts-ignore
function stripFunctions(data) {
  return JSON.parse(JSON.stringify(data));
}
//@ts-ignore
const getApp = async (appKey, stripFuncs = true) => {
  let appData = cloneDeep(await getAppDefaultExport(appKey));

  if (appData.auth) {
    appData = addAuthenticationSteps(appData);
    appData = addReconnectionSteps(appData);
  }
//@ts-ignore
  appData.triggers = appData?.triggers?.map((trigger) => {
    return addStaticSubsteps('trigger', appData, trigger);
  });
//@ts-ignore
  appData.actions = appData?.actions?.map((action) => {
    return addStaticSubsteps('action', appData, action);
  });

  if (stripFuncs) {
    return stripFunctions(appData);
  }

  return appData;
};

const chooseConnectionStep = {
  key: 'chooseConnection',
  name: 'Choose connection',
};
//@ts-ignore
const testStep = (stepType) => {
  return {
    key: 'testStep',
    name: stepType === 'trigger' ? 'Test trigger' : 'Test action',
  };
};
//@ts-ignore
const addStaticSubsteps = (stepType, appData, step) => {
  const computedStep = omit(step, ['arguments']);

  computedStep.substeps = [];

  if (appData.supportsConnections && step.supportsConnections !== false) {
    computedStep.substeps.push(chooseConnectionStep);
  }

  if (step.arguments) {
    computedStep.substeps.push({
      key: 'chooseTrigger',
      name: stepType === 'trigger' ? 'Set up a trigger' : 'Set up action',
      arguments: step.arguments,
    });
  }

  computedStep.substeps.push(testStep(stepType));

  return computedStep;
};

export default getApp;
