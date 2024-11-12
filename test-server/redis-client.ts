import {createClient, RedisClientType} from "redis";

declare global {
    var redisClient: RedisClientType | undefined;
}

const client = global.redisClient || createClient({
    socket: {
      host: '127.0.0.1',
      port: 6379
    }
});

if (!global.redisClient){
    client.connect()
        .then(() => console.log("Connected to REDIS!"))
        .catch(err => console.error("Error occured while connecting or accessing REDIS server:", err));

    global.redisClient = client;
}

export default client;