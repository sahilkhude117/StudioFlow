import appConfig from "./app";

const redisConfig = {
    username: appConfig.redisUsername,
    password: appConfig.redisPassword, 
    db: appConfig.redisDb,
    enableOfflineQueue: false,
    enableReadyCheck: true,
}

if (appConfig.redisSentinelHost) {
    //@ts-ignore
    redisConfig.sentinels = [
        {
            host: appConfig.redisSentinelHost,
            port: appConfig.redisSentinelPort,
        }
    ];
    //@ts-ignore
    redisConfig.sentinelUsername = appConfig.redisSentinelUsername;
    //@ts-ignore
    redisConfig.sentinelPassword = appConfig.redisSentinelPassword;
    //@ts-ignore
    redisConfig.name = appConfig.redisName;
    //@ts-ignore
    redisConfig.role = appConfig.redisRole;
} else {
    //@ts-ignore
    redisConfig.host = appConfig.redisHost;
    //@ts-ignore
    redisConfig.port = appConfig.redisPort;
}

if (appConfig.redisTls) {
    //@ts-ignore
    redisConfig.tls = {};
}

export default redisConfig;