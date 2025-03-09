import Analytics from '@rudderstack/rudder-sdk-node';
import organizationId from './organization-id.js';
import instanceId from './instance-id.js';
import appConfig from '../../config/app.js';
import os from 'os';

const WRITE_KEY = '284Py4VgK2MsNYV7xlKzyrALx0v';
const DATA_PLANE_URL = 'https://telemetry.automatisch.io/v1/batch';
const CPUS = os.cpus();
const SIX_HOURS_IN_MILLISECONDS = 21600000;

class Telemetry {
  constructor() {
    //@ts-ignore
    this.client = new Analytics(WRITE_KEY, DATA_PLANE_URL);
    //@ts-ignore
    this.organizationId = organizationId();
    //@ts-ignore
    this.instanceId = instanceId();
  }
//@ts-ignore
  setServiceType(type) {
    //@ts-ignore
    this.serviceType = type;
  }
//@ts-ignore
  track(name, properties) {
    if (!appConfig.telemetryEnabled) {
      return;
    }

    properties = {
      ...properties,
      appEnv: appConfig.appEnv,
      //@ts-ignore
      instanceId: this.instanceId,
    };
//@ts-ignore
    this.client.track({
        //@ts-ignore
      userId: this.organizationId,
      event: name,
      properties,
    });
  }
//@ts-ignore
  stepCreated(step) {
    this.track('stepCreated', {
      stepId: step.id,
      flowId: step.flowId,
      createdAt: step.createdAt,
      updatedAt: step.updatedAt,
    });
  }
//@ts-ignore
  stepUpdated(step) {
    this.track('stepUpdated', {
      stepId: step.id,
      flowId: step.flowId,
      key: step.key,
      appKey: step.appKey,
      type: step.type,
      position: step.position,
      status: step.status,
      createdAt: step.createdAt,
      updatedAt: step.updatedAt,
    });
  }
//@ts-ignore
  flowCreated(flow) {
    this.track('flowCreated', {
      flowId: flow.id,
      name: flow.name,
      active: flow.active,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    });
  }
//@ts-ignore
  flowUpdated(flow) {
    this.track('flowUpdated', {
      flowId: flow.id,
      name: flow.name,
      active: flow.active,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    });
  }
//@ts-ignore
  executionCreated(execution) {
    this.track('executionCreated', {
      executionId: execution.id,
      flowId: execution.flowId,
      testRun: execution.testRun,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    });
  }
//@ts-ignore
  executionStepCreated(executionStep) {
    this.track('executionStepCreated', {
      executionStepId: executionStep.id,
      executionId: executionStep.executionId,
      stepId: executionStep.stepId,
      status: executionStep.status,
      createdAt: executionStep.createdAt,
      updatedAt: executionStep.updatedAt,
    });
  }
//@ts-ignore
  connectionCreated(connection) {
    this.track('connectionCreated', {
      connectionId: connection.id,
      key: connection.key,
      verified: connection.verified,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    });
  }
//@ts-ignore
  connectionUpdated(connection) {
    this.track('connectionUpdated', {
      connectionId: connection.id,
      key: connection.key,
      verified: connection.verified,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    });
  }

  diagnosticInfo() {
    this.track('diagnosticInfo', {
      automatischVersion: appConfig.version,
      serveWebAppSeparately: appConfig.serveWebAppSeparately,
      //@ts-ignore
      serviceType: this.serviceType,
      operatingSystem: {
        type: os.type(),
        version: os.version(),
      },
      memory: os.totalmem() / (1024 * 1024), // To get as megabytes
      cpus: {
        count: CPUS.length,
        model: CPUS[0].model,
        speed: CPUS[0].speed,
      },
    });

    setTimeout(() => this.diagnosticInfo(), SIX_HOURS_IN_MILLISECONDS);
  }
}

const telemetry = new Telemetry();
telemetry.diagnosticInfo();

export default telemetry;
