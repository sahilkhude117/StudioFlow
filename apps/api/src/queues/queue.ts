import process from "process";
import { Queue } from "bullmq";
import redisConfig from "../config/redis";
import logger from "../helpers/logger";
import { repeat } from "lodash";

const CONNECTION_REFUSED = 'ECONNREFUSED';

const redisConnection = {
    connetion: redisConfig,
}
//@ts-ignore
export const generateQueue = (queueName, options) => {
    //@ts-ignore
    const queue = new Queue(queueName, redisConnection);

    queue.on('error', (error) => queueOnError(error, queueName));

    if(options?.runDaily) addScheduler(queueName, queue);

    return queue;
};
//@ts-ignore
const queueOnError = (error, queueName) => {
    if (error.code === CONNECTION_REFUSED) {
        const errorMessage = 
            `Make sure you have installed Redis and it is running.`;
        
        logger.error(errorMessage, error);

        process.exit();
    }

    logger.error(`Error happened in ${queueName} queue!`, error);
}
//@ts-ignore
const addScheduler = (queueName, queue) => {
    const everydayAtOneOclock = '0 1 * * *';

    queue.add(queueName, null, {
        jobId: queueName,
        repeat: {
            pattern: everydayAtOneOclock,
        }
    })
}