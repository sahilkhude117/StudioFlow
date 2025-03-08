import BaseError from './base.js';

export default class HttpError extends BaseError {
  //@ts-ignore
  constructor(error) {
    const computedError = error.response?.data || error.message;
    super(computedError);
    //@ts-ignore
    this.response = error.response;
  }
}
