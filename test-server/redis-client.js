import redis from "redis";

let redisClient;

if (!redisClient) redisClient = redis.createClient(6379, "127.0.0.1");

redisClient.on('error', (err) => {
    console.log('Error occured while connecting or accessing redis server');
});

await redisClient.connect();

//Temporarily instead of an actual REDIS
// const redisClient = {
//     dict: {},

//     //Pushes element at given key.
//     push(table, key, item){
//         this.dict[table][key] = item;
//     },

//     remove(key){
//         delete this.dict[key];
//     },

//     get(key){
//         if (!(this.contains)) throw new Error(`key ${key} does not exist`);
//         return this.dict[key];
//     },

//     contains(key){
//         return key in this.dict;
//     }
// }

export default redisClient;