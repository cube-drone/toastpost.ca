
const createRedis = require('./redis');
const createDatabase = require('./database');

const testRedis = async () => {
    const stringRedisUri = process.env.REDIS_URI;
    return createRedis({name: "test", redisUri: stringRedisUri});
};

const testDatabase = async () => {
    // DATABASE VARS
    const databaseUri = process.env.DATABASE_URI;
    const sequelize = await createDatabase({databaseUri});
    return sequelize;
};

module.exports = {
    testRedis,
    testDatabase,
}