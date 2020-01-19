
const docker = require('./docker.jake');
const irun = require('./run.jake').irun;
const run = require('./run.jake').run;

const DOCKER_NAME = 'postgres-local';

const POSTGRES_PORT = 5432;
const DATABASE_NAME = 'groovelet';
const DATABASE_USER = 'localboy';
const DATABASE_PASSWORD = 'elephantsassacre291';

async function start(){

    //ports: [POSTGRES_PORT],
    await docker.start({
        name: DOCKER_NAME,
        container: 'postgres',
        ports: [POSTGRES_PORT],
        environment: {
            'POSTGRES_PASSWORD': DATABASE_PASSWORD,
            'POSTGRES_USER': DATABASE_USER,
            'POSTGRES_DB': DATABASE_NAME,
        },
        detached: true,
    })

    return;
}
namespace('postgres', ()=>{
    desc("Start postgres");
    task('start', start);
});

async function stop(){
    return docker.stop({
        name: DOCKER_NAME,
    });
}
namespace('postgres', ()=>{
    desc("Stop postgres");
    task('stop', stop);
});

async function available(){
    return docker.isRunning({name: DOCKER_NAME})
};
namespace('postgres', ()=>{
    desc("Returns true if postgres is available, false otherwise");
    task('available', available);
});

async function uri(){
    let uri = `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${POSTGRES_PORT}/${DATABASE_NAME}`;
    console.log(uri);
    return(uri);
};
namespace('postgres', ()=>{
    desc("Print out a URI that we can use to connect to postgres");
    task('uri', uri);
});

async function clean(){
    await stop();
};
namespace('postgres', ()=>{
    desc("Destroy any and all running cockroach services");
    task('clean', clean);
});


module.exports = {
    start, stop, available, uri, clean,
};
