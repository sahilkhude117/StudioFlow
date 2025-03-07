import morgan from "morgan";
import logger from "./logger";

const stream = {
    write: (message:any) => 
        logger.http(message.substring(0, message.lastIndexOf('\n'))),   
}

const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream }
);

export default morganMiddleware;