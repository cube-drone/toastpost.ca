const Tance = require('redistance').Tance;
const uuid = require('uuid/v4');
const assert = require('assert');
const Redis = require('redis');

async function establishConnection({name, redisUri}){

    //console.log(`Singing in harmony with redis-${name}...`);

    const listRedisUris = redisUri.split(",");
    let redisClient;

    // by setting "detect_buffers" in the server options, we should give ourselves the option to
    //  retrieve _either_ a string or binary data from the client
    /*
        here's the example from the documentation:

        client.set("foo_rand000000000000", "OK");

        // This will return a JavaScript String
        client.get("foo_rand000000000000", function (err, reply) {
            console.log(reply.toString()); // Will print `OK`
        });

        // This will return a Buffer since original key is specified as a Buffer
        client.get(new Buffer("foo_rand000000000000"), function (err, reply) {
            console.log(reply.toString()); // Will print `<Buffer 4f 4b>`
        });
     */

    // use the redis URI to construct and test a redis connection

    // if we provide a stack of URLs, connect to them cluster-style
    if(listRedisUris.length > 1){
        const RedisClustr = require('redis-clustr');

        let hosts = listRedisUris.map(stringUrl => new URL(stringUrl).host.split(":"));
        let serverObjects = hosts.map(([host, port]) => {return {host, port: parseInt(port), detect_buffers:true}});

        redisClient = new RedisClustr({servers: serverObjects});

        return new Promise((resolve, reject) =>{

            redisClient.on('error', (err)=>{
                console.error(err);
            });

            redisClient.on('fullReady', async ()=>{
                let upgradedRedisClient = new Tance(redisClient);

                resolve(upgradedRedisClient);
            });
        })
    }
    else{
        redisClient = Redis.createClient({url: listRedisUris[0], detect_buffers:true});

        redisClient.on('error', (err)=>{
            console.error(err);
        });

        let upgradedRedisClient = new Tance(redisClient);

        await upgradedRedisClient.ready();

        return upgradedRedisClient;
    }
}

async function testConnection(upgradedRedisClient){
    let testKey = `test-${uuid()}`;
    let testVal = uuid();

    await upgradedRedisClient.set(testKey, testVal, "EX", 60);

    let testVerify = await upgradedRedisClient.get(testKey);

    assert.equal(testVal, testVerify);

    return upgradedRedisClient;
}

module.exports = async ({name, redisUri}) => {
    return establishConnection({name, redisUri}).then(testConnection);
};