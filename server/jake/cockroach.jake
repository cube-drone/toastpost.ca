
const docker = require('./docker.jake');
const irun = require('./run.jake').irun;
const run = require('./run.jake').run;

const COCKROACH_PORT = 26257;
const COCKROACH_MANAGEMENT_PORT = 8080;
const COCKROACH_NAME = 'cockroach';
const COCKROACH_USER = 'dragonfly';
const DATABASE_NAME = 'groovelet';

const CLUSTER_PORTS = [26258, 26259];
const COCKROACH_CLUSTER_NETWORK_NAME = "cockroach_cluster_net";

async function clusterStart(){
    docker.createNetwork({name: COCKROACH_CLUSTER_NETWORK_NAME});
    
    /*
        // TO CREATE
        docker run -d \
        --name=roach1 \
        --hostname=roach1 \
        --net=roachnet \
        -p 26257:26257 -p 8080:8080  \
        -v "${PWD}/cockroach-data/roach1:/cockroach/cockroach-data"  \
        cockroachdb/cockroach:v19.1.4 start --insecure

        // TO JOIN
        docker run -d \
        --name=roach2 \
        --hostname=roach2 \
        --net=roachnet \
        -v "${PWD}/cockroach-data/roach2:/cockroach/cockroach-data" \
        cockroachdb/cockroach:v19.1.4 start --insecure --join=roach1
    */

    await docker.start({
        name: `${COCKROACH_NAME}-master`,
        ports: [COCKROACH_PORT, COCKROACH_MANAGEMENT_PORT],
        network: COCKROACH_CLUSTER_NETWORK_NAME,
        container: 'cockroachdb/cockroach:v19.1.4',
        volumes: {"/tmp/cockroach-data/roach1":"/cockroach/cockroach-data"},
        detached: true,
        environment: {},
        command: `start --insecure`
    })

    let promises = CLUSTER_PORTS.map((cluster_port) => {
        //docker run -d --name "redis-"$port -p $port:6379 --net $network_name $redis_image $start_cmd;

        let localvolume = `/tmp/cockroach-data/roach-${cluster_port}`;

        //-p host:container
        return docker.start({
            name: `${COCKROACH_NAME}-${cluster_port}`,
            complexArgs: `-p ${cluster_port}:${COCKROACH_PORT}`,
            network: COCKROACH_CLUSTER_NETWORK_NAME,
            container: 'cockroachdb/cockroach:v19.1.4',
            volumes: {[localvolume]:"/cockroach/cockroach-data"},
            detached: true,
            environment: {},
            command: `start --insecure`
        })
    });

    await Promise.all(promises);

    // Now that we've created the cockroach cluster, we need to create a database user and permissions
    await run(`cockroach sql --insecure --execute="CREATE USER IF NOT EXISTS ${COCKROACH_USER};"`);
    await run(`cockroach sql --insecure --execute="CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}"`);
    await run(`cockroach sql --insecure --execute="GRANT ALL ON DATABASE ${DATABASE_NAME} TO ${COCKROACH_USER};"`);
    
    return;
}
namespace('cockroach', ()=>{
    desc("Start cockroach cluster");
    task('start', clusterStart);
});

async function clusterStop(){
    await docker.stop({
        name: `${COCKROACH_NAME}-master`
    });
    let promises = CLUSTER_PORTS.map((cluster_port) => {
        return docker.stop({
            name: `${COCKROACH_NAME}-${cluster_port}`,
        }).catch((err)=>{})
    });

    await Promise.all(promises);
}
namespace('cockroach', ()=>{
    desc("Stop cockroach cluster");
    task('stop', clusterStop);
});

async function clusterAvailable(){
    return docker.isRunning({name: COCKROACH_NAME})
};
namespace('cockroach', ()=>{
    desc("Returns true if the cluster is available, false otherwise");
    task('available', clusterAvailable);
});

async function clusterUri(){
    let uri = `postgresql://${COCKROACH_USER}:@localhost:${COCKROACH_PORT}/${DATABASE_NAME}`;
    console.log(uri);
    return(uri);
};
namespace('cockroach', ()=>{
    desc("Print out a URIs that we can use to connect to the cockroach cluster");
    task('uri', clusterUri);
});

async function clean(){
    await clusterStop();
};
namespace('cockroach', ()=>{
    desc("Destroy any and all running cockroach services");
    task('clean', clean);
});


module.exports = {
    start: clusterStart, stop: clusterStop, available: clusterAvailable, uri: clusterUri,
    clusterStart, clusterStop, clusterAvailable, clusterUri,
    clean,
};
