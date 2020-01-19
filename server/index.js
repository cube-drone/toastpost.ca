console.log("Toot toot!");

const title = "toastpost.ca";
const description = "toastpost is a service for sending letters for your friends";

const express = require('express');
const bodyParser = require('body-parser');
const responseTime = require('response-time');                  // Response-time is middleware for loggin' response times!
const uuid = require('uuid/v4');

// Models
const UserModel = require('./models/UserModel');

// Routes
const tuneRoute = require('./routes/user');
const testRoute = require('./routes/test');

// Services
const pipeline = require('./pipeline');
const createRedis = require('./services/redis');
const createDatabase = require('./services/database');
const StaticSetup = require('./services/static');

// Music
const Heart = require('./music/heart');

// Templates
const indexTemplate = require('./templates/index.html.js');

// Variables
// SERVER VARS
const port = process.env.PORT || process.env.GROOVELET_PORT || '40000';
console.log(`port ${port}`);

const nodeType = process.env.NODE_TYPE || 'api';
console.log(`node type: ${nodeType}`);

const serverName = process.env.SERVER_NAME ||  `local-${uuid()}`;
console.log(`server name: ${serverName}`)

// REDIS VARS
// This is the default redis cluster we'll use for everything.
const stringRedisUri = process.env.REDIS_URI;

if(stringRedisUri == null){
    console.error("No Redis URI provided! Shutting down!")
    process.exit(1);
}

//Cache (Cardboard) - Aggressive eviction, can be cleared, used for cache.
const cacheRedisUri = process.env.CACHE_REDIS_URI || stringRedisUri;
const schedulerRedisUri = process.env.SCHEDULER_REDIS_URI || stringRedisUri;
const gameRedisUri = process.env.GAME_REDIS_URI || stringRedisUri;

// DATABASE VARS
const databaseUri = process.env.DATABASE_URI;

if(databaseUri == null){
    console.error("No Database URI provided! Shutting down!");
    process.exit(1);
}

let environment = {
    serverName,
    nodeType,
    port
};

// Create a new express application instance
const app = express();

const main = async () => {

    const cacheRedis = await createRedis({name: "cache", redisUri: cacheRedisUri});
    const schedulerRedis = await createRedis({name: "scheduler", redisUri: schedulerRedisUri});
    const gameRedis = await createRedis({name: "game", redisUri: gameRedisUri});

    const database = await createDatabase({databaseUri});
        
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    app.use(bodyParser.json());

    app.use(responseTime((req, res, time) => {
        time = Math.ceil(time);
        console.log(`${req.method} ${req.url} ${time}-ms`)
    }));
        
    let httpServer = require('http').createServer(app);

    let services = {
        app,
        httpServer,
        cacheRedis,
        schedulerRedis,
        gameRedis,
        database,
        ...environment,
    };
        
    let userModel = await UserModel(services);
    services.UserModel = userModel;

    if(nodeType === 'api'){

        StaticSetup(services);

        // Routes
        tuneRoute(services);
        testRoute(services);

        const serveApp = (req, res) => {
            let html = indexTemplate({title, description, javascriptAssets: ['/client/index.js']});
            res.send(html);
        }

        app.get('/', serveApp);
        app.get('/loading', serveApp);
        app.get('/login', serveApp);
        app.get('/prompt', serveApp);

        // Pipeline
        pipeline(services);

        httpServer.listen(port, function() {
            console.log(`API Node running on port ${port}`);
        });
    }
    else if(nodeType === 'worker'){

    }
    else {
        console.warn(`Unknown Node Type: ${nodeType}`);
        
        httpServer.listen(port, function() {
            console.log(`${nodeType} node running on port ${port}`);
        });
    }

};

main().catch((err)=>{
    console.error(`ERROR 1: Critical, unrecoverable error`, err);
});

