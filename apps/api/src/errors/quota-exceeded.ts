import BaseError from "./base";

export default class QuotaExceededError extends BaseError {
    constructor(error = 'The allowed task qouta has been exhausted!'){
        super(error);
        //@ts-ignore
        this.statusCode = 422;
    }
}