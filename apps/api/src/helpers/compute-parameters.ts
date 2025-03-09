import get from 'lodash.get';

const variableRegExp = /({{step\.[\da-zA-Z-]+(?:\.[^.}{]+)+}})/g;
//@ts-ignore
function getParameterEntries(parameters) {
  return Object.entries(parameters);
}
//@ts-ignore
function getFieldByKey(key, fields = []) {
  //@ts-ignore
  return fields.find((field) => field.key === key);
};
//@ts-ignore
function getParameterValueType(parameterKey, fields) {
  const field = getFieldByKey(parameterKey, fields);
  const defaultValueType = 'string';
  //@ts-ignore
  return field?.valueType || defaultValueType;
}
//@ts-ignore
function computeParameterEntries(parameterEntries, fields, executionSteps) {
  const defaultComputedParameters = {};
  //@ts-ignore
  return parameterEntries.reduce((result, [key, value]) => {
    const parameterComputedValue = computeParameter(key, value, fields, executionSteps);

    return {
      ...result,
      [key]: parameterComputedValue,
    }
  }, defaultComputedParameters);
}
//@ts-ignore
function shouldAutoParse(key, fields) {
  const parameterValueType = getParameterValueType(key, fields);
  const shouldAutoParse = parameterValueType === 'parse';

  return shouldAutoParse;
}
//@ts-ignore
function computeParameter(key, value, fields, executionSteps) {
  if (typeof value === 'string') {
    const computedStringParameter = computeStringParameter(key, value, fields, executionSteps);
    return computedStringParameter;
  }

  if (Array.isArray(value)) {
    const computedArrayParameter = computeArrayParameter(key, value, fields, executionSteps);
    return computedArrayParameter;
  }

  return value;
}
//@ts-ignore
function splitByVariable(stringValue) {
  const parts = stringValue.split(variableRegExp);

  return parts;
}
//@ts-ignore
function isVariable(stringValue) {
  return stringValue.match(variableRegExp);
}
//@ts-ignore
function splitVariableByStepIdAndKeyPath(variableValue) {
  const stepIdAndKeyPath = variableValue.replace(/{{step.|}}/g, '');
  const [stepId, ...keyPaths] = stepIdAndKeyPath.split('.');
  const keyPath = keyPaths.join('.');

  return {
    stepId,
    keyPath
  }
}
//@ts-ignore
function getVariableStepId(variableValue) {
  const { stepId } = splitVariableByStepIdAndKeyPath(variableValue);

  return stepId;
}
//@ts-ignore
function getVariableKeyPath(variableValue) {
  const { keyPath } = splitVariableByStepIdAndKeyPath(variableValue);

  return keyPath
}
//@ts-ignore
function getVariableExecutionStep(variableValue, executionSteps) {
  const stepId = getVariableStepId(variableValue);
//@ts-ignore
  const executionStep = executionSteps.find((executionStep) => {
    return executionStep.stepId === stepId;
  });

  return executionStep;
}
//@ts-ignore
function computeVariable(variable, executionSteps) {
  const keyPath = getVariableKeyPath(variable);
  const executionStep = getVariableExecutionStep(variable, executionSteps);
  const data = executionStep?.dataOut;
  const computedVariable = get(data, keyPath);

  /**
   * Inline both arrays and objects. Otherwise, variables resolving to
   * them would be resolved as `[object Object]` or lose their shape.
   */
  if (typeof computedVariable === 'object') {
    return JSON.stringify(computedVariable);
  }

  return computedVariable;
}
//@ts-ignore
function autoParseComputedVariable(computedVariable) {
  // challenge the input to see if it is stringified object or array
  try {
    const parsedValue = JSON.parse(computedVariable);

    if (typeof parsedValue === 'number') {
      throw new Error('Use original unparsed value.');
    }

    return parsedValue;
  } catch (error) {
    return computedVariable;
  }
}
//@ts-ignore
function computeStringParameter(key, stringValue, fields, executionSteps) {
  const parts = splitByVariable(stringValue);

  const computedValue = parts
  //@ts-ignore
    .map((part) => {
      const variable = isVariable(part);

      if (variable) {
        return computeVariable(part, executionSteps);
      }

      return part;
    })
    .join('');

  const autoParse = shouldAutoParse(key, fields);
  if (autoParse) {
    const autoParsedValue = autoParseComputedVariable(computedValue);

    return autoParsedValue;
  }

  return computedValue;
}
//@ts-ignore
function computeArrayParameter(key, arrayValue, fields = [], executionSteps) {
    //@ts-ignore
  return arrayValue.map((item) => {
    //@ts-ignore
    const itemFields = fields.find((field) => field.key === key)?.fields;

    return computeParameters(item, itemFields, executionSteps);
  });
}
//@ts-ignore
export default function computeParameters(parameters, fields, executionSteps) {
  const parameterEntries = getParameterEntries(parameters);

  return computeParameterEntries(parameterEntries, fields, executionSteps);
}
