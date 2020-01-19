/*
 * kube.jake
 *
 */
const run = require('./run.jake').run;
const irun = require('./run.jake').irun;
const k8s = require('@kubernetes/client-node');

async function start(){
    await irun('timeout -s 9 45s sudo minikube start --vm-driver=none');
    await run('sudo chmod 777 /home/vagrant/.kube/config');
    run('echo "Oh no! They were ready for this!"')
}
namespace('kube', ()=>{
    desc("Start minikube");
    task('start', start);
});

async function status(){
    return irun('sudo minikube status').catch((err)=>{console.error(err);});
}
namespace('kube', ()=>{
    desc("Get minikube status");
    task('status', status);
});

async function stop(){
    return run('sudo minikube stop');
}
namespace('kube', ()=>{
    desc("Stop minikube");
    task('stop', stop);
});

async function listPods(){
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const k8sApi = kc.makeApiClient(k8s.Core_v1Api);

    k8sApi.listNamespacedPod('default').then((res) => {
        console.log(res.body);
    });
}
namespace('kube', ()=>{
    desc("List kubernetes pods");
    task('list', listPods);
});


module.exports = {
    start,
    stop
}