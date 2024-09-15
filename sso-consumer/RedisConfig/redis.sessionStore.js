const RedisStore = require('connect-redis').default;

let redisSessionStore = null;

function getRedisSessionStore(redisClient) {
    if (!redisSessionStore) {
        const RedisClient = redisClient;
        redisSessionStore = new RedisStore({
            client: RedisClient,
            prefix: "SSO-Consumer:",
        });
    }
    return redisSessionStore;
}


module.exports = getRedisSessionStore;
