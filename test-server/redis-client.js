

//Temporarily instead of an actual REDIS
const redisClient = {
    dict: {},

    //Pushes element at given key. Creates an array if the key does not exist.
    push(key, item){
        if (!(this.contains(key))) this.dict[key] = [];
        this.dict[key].push(item);
    },

    get(key){
        if (!(this.contains)) throw new Error(`key ${key} does not exist`);
        return this.dict[key];
    },

    contains(key){
        return key in this.dict;
    }
}

export default redisClient;