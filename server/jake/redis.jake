const docker = require('./docker.jake');
const irun = require('./run.jake').irun;
const run = require('./run.jake').run;

const REDIS_PORT = 6379;
const redis_docker_name = "test-redis";
const cluster_docker_name = "cluster-redis";

const CLUSTER_PORTS = [6380, 6381, 6382, 6383, 6384, 6385];
const REDIS_CLUSTER_NETWORK_NAME = "redis_cluster_net";

/*
 * Build and start Redis
 */
function start(){
    return docker.start({name: redis_docker_name,
        container: 'redis',
        detached: true,
        ports: [REDIS_PORT],
        environment: {}});
}
namespace('redis', ()=>{
    desc("Start redis");
    task('start', start);
});


/*
 * Destroy and clean up the Redis instance.
 */
function stop(){
    return docker.stop({name: redis_docker_name}).catch((err)=>{});
}
namespace('redis', ()=>{
    desc("Stop redis");
    task('stop', stop);
});

/*
 * Is redis available?
 */
function available(){
    return docker.isRunning({name: redis_docker_name});
}
namespace('redis', ()=>{
    desc("true if Redis is available, false otherwise");
    task('available', available);
});

/*
 * Get the Redis URI
 */
function uri(){
    return `redis://localhost:${REDIS_PORT}`;
}
namespace(`redis`, ()=>{
    desc("Get redis' URI");
    task('start', start);
});

async function clusterStart(){
    docker.createNetwork({name: REDIS_CLUSTER_NETWORK_NAME});

    let promises = CLUSTER_PORTS.map((cluster_port) => {
        //docker run -d --name "redis-"$port -p $port:6379 --net $network_name $redis_image $start_cmd;

        //-p host:container
        return docker.start({
            name: `${cluster_docker_name}-${cluster_port}`,
            complexArgs: `-p ${cluster_port}:${REDIS_PORT}`,
            network: REDIS_CLUSTER_NETWORK_NAME,
            container: 'redis',
            detached: true,
            environment: {},
            command: `redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes`
        })
    });

    await Promise.all(promises);

    let additionalPromises = CLUSTER_PORTS.map(async (cluster_port) => {
        //docker run -d --name "redis-"$port -p $port:6379 --net $network_name $redis_image $start_cmd;
        let ip = await docker.getIp({network: REDIS_CLUSTER_NETWORK_NAME, name: `${cluster_docker_name}-${cluster_port}`});
        ip = ip.trim();
        let cluster_host = `${ip}:${REDIS_PORT}`;
        console.warn(`CLUSTER HOST: ${cluster_host}`);

        return cluster_host;
    });

    let hosts = await Promise.all(additionalPromises);

    let command = `redis-cli --cluster create ${hosts.join(" ")} --cluster-replicas 1`;
    let cmd =`echo "yes" | docker run -i --rm --net ${REDIS_CLUSTER_NETWORK_NAME} --name=${cluster_docker_name}-command redis ${command}`;
    console.log(cmd);

    return irun(cmd);
}
namespace('cluster', ()=>{
    desc("Start redis cluster");
    task('start', clusterStart);
});

async function clusterStop(){
    let promises = CLUSTER_PORTS.map((cluster_port) => {
        return docker.stop({
            name: `${cluster_docker_name}-${cluster_port}`,
        }).catch((err)=>{})
    });

    await Promise.all(promises);
}
namespace('cluster', ()=>{
    desc("Stop redis cluster");
    task('stop', clusterStop);
});

async function clusterAvailable(){
    return docker.isRunning({name: cluster_docker_name})
};
namespace('cluster', ()=>{
    desc("Returns true if the cluster is available, false otherwise");
    task('available', clusterAvailable);
});

async function clusterUri(){
    let uri = CLUSTER_PORTS.map((port) => `redis://localhost:${port}`).join(",");
    console.log(uri);
    return uri;
};
namespace('cluster', ()=>{
    desc("Print out a series of comma-separated URIs that we can use to connect to the cluster");
    task('uri', clusterUri);
});

async function clean(){
    await stop();
    await clusterStop();
};
namespace('cluster', ()=>{
    desc("Destroy any and all running redis services");
    task('clean', clean);
});
namespace('redis', ()=>{
    desc("Destroy any and all running redis services");
    task('clean', clean);
});


module.exports = {
    start, stop, available, uri,
    clusterStart, clusterStop, clusterAvailable, clusterUri,
    clean,
};
