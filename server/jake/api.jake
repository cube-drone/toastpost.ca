const redis = require('./redis.jake');
const cockroach = require('./cockroach.jake');
const postgres = require('./postgres.jake');
const run = require('./run.jake').run;
const irun = require('./run.jake').irun;

/*
 * Build and start the server
 */
async function start(){
    let redisUri = null;
    if(await redis.clusterAvailable()){
        console.log("Cluster available, using that");
        redisUri = await redis.clusterUri();
    }
    else if(await redis.available()){
        console.log("Redis available, using that");
        redisUri = await redis.uri();
    }
    else{
        console.log("Nothing available, booting redis");
        await redis.start();
        redisUri = await redis.uri();
    }

    if(await postgres.available()){
        console.log("Postgres available!");
    }
    else{
        await postgres.start();
    }
    let databaseUri = await postgres.uri();

    console.log("Getting ready to run...");

    irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} PORT=39995 NODE_TYPE=scheduler node index.js`);
    irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} PORT=39996 NODE_TYPE=heart node index.js`);
    irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} PORT=39997 NODE_TYPE=ticker node index.js`);
    irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} PORT=39998 NODE_TYPE=ticker node index.js`);
    irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} PORT=39999 NODE_TYPE=agent node index.js`);
    await irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} PORT=40000 NODE_TYPE=api node index.js`);
}
namespace('api', ()=>{
    desc("Start the server");
    task('start', start);
});

async function test(){
    let redisUri = null;
    if(await redis.clusterAvailable()){
        console.log("Cluster available, using that");
        redisUri = await redis.clusterUri();
    }
    else if(await redis.available()){
        console.log("Redis available, using that");
        redisUri = await redis.uri();
    }
    else{
        console.log("Nothing available, booting redis");
        await redis.start();
        redisUri = await redis.uri();
    }

    if(await postgres.available()){
        console.log("Postgres available!");
    }
    else{
        await postgres.start();
    }
    let databaseUri = await postgres.uri();

    console.log("Getting ready to run tests...");

    await irun(`REDIS_URI=${redisUri} DATABASE_URI=${databaseUri} mocha tests models grid --exit`);
}
namespace('api', ()=>{
    desc("Run the tests");
    task('tests', test);
});


module.exports = {
    start,
    test
}


