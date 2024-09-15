const { createClient } = require('redis');


// Singleton Pattern
// The Singleton pattern ensures that only one instance of the Redis client 
// is created and used throughout the application.
let redisClient;

async function connectRedisClient(dbURL) {
    if (!redisClient) {
        redisClient = createClient({ url: dbURL });
        // redisClient.on('error', (err) => console.error('Redis Client Error', err));
        
        try {
            await redisClient.connect();
            console.log("Redis Connected Successfully!  🔴 ✅");
        } catch (err) {
            console.error('Error connecting to Redis:', err);
            redisClient.quit(); // Optionally close the client on error
            throw err;
        }
    }
    return redisClient;
}

function getRedisClient(){
    console.log("Getting Redis Client!")
    return redisClient;
}

module.exports = { connectRedisClient, getRedisClient };