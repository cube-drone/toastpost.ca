/*
    the main entry point for our whatsamajigger
*/

const axios = require('axios');

// main setup
const React = require('react');
const ReactDOM = require('react-dom');
const Provider = require('react-redux').Provider;

const createBrowserHistory = require('history').createBrowserHistory;
import {applyMiddleware, combineReducers, createStore, compose}  from 'redux';

import logger from 'redux-logger'
import promise from 'redux-promise-middleware';

import * as PIXI from 'pixi.js';

const Tone = require('tone');

const TransportTycoonDeluxe = require("./TransportTycoonDeluxe");

// Layouts
const MainLayout = require('./components/MainLayout');

// Reducers
const windowReducer = require('./reducers/windowReducer');
const metronomeReducer = require('./reducers/metronomeReducer');
const loadingReducer = require('./reducers/loadingReducer');

// Actions
const {changeWindow} = require('./actions/window');
const {metronomeActive, metronomeInactive} = require('./actions/metronome');

//const reducer = require('./reducers');
//const listeners = require('./listeners');

// not used
/*
const axios = require('axios');
*/

// input => a keyboard event might produce a KeyboardEvent, which might be caught by a MappingListener and converted into an UpEvent

async function main(){
    console.log("Initializing groovelet32.exe");

    // app is the top-level component in the HTML page that we'll be mounting everything beneath
    const app = document.getElementById('app');

    // Setup history (this is important for routing)
    const history = createBrowserHistory();
    
    // Setup Middleware
    const middleware = applyMiddleware(promise, logger);

    // add debugging tools if present and we're in dev
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    // Setup reducer and store
    let reducer = combineReducers({
        window: windowReducer,
        metronome: metronomeReducer,
        loading: loadingReducer,
        // windowSizeReducer
        // inputReducer
    });

    const store = createStore(reducer, composeEnhancers(middleware));

    //store.subscribe(listeners(store));
    
    window.ttd = TransportTycoonDeluxe();

    ReactDOM.render(<Provider store={store}>
        <MainLayout store={store}/>
    </Provider>, app);

    window.addEventListener("resize", ()=>{
        store.dispatch(changeWindow());
    });

    //window.transport = false;
    let toggled = false;
    document.body.addEventListener('click', () => {
        if(!toggled){
            window.ttd.start();
            toggled = true;
            store.dispatch(metronomeActive());
        }
        else{
            // we only do this in development mode
            window.ttd.stop();
            toggled = false;
            store.dispatch(metronomeInactive());
        }
    })

    document.addEventListener("visibilitychange", ()=>{
        if(document.visibilityState == "hidden"){
            window.ttd.stop();
            toggled = false;
            store.dispatch(metronomeInactive());
        }
        else{
            window.ttd.start();
            toggled = true;
            store.dispatch(metronomeActive());
        }
    });

    // here's where we might save the place tha the user WAS going
    //  but before we do that, we need to go through /loading and /login
    history.push("/loading");

    let BASE_CONNECT_MS = 1000;
    let pipelineEndpoint = window.location.origin.replace("http", "ws") + "/pipeline";
    let socketReconnectTimeout = BASE_CONNECT_MS;
    const connectSocket = async () => {
        //let routeSocketMessage = pipelineRouter({store});

        console.log(`Connecting to ${pipelineEndpoint}`);

        const socket = new WebSocket(pipelineEndpoint);

        socket.addEventListener('open', function(event){
            console.log("Successfully created socket connection!");
        });

        socket.addEventListener('message', function message(event){
            if(event.data == null){
                return;
            };

            let data = JSON.parse(event.data);

            if(data.err != null){
                console.error("SOCKET:", data.err);
                if(data.err.indexOf('authToken') >= -1){
                    store.dispatch(clearStatusCode());
                    store.dispatch(logout());
                    store.dispatch(saveLoginTarget({targetPath: window.location.pathname + window.location.search}));
                    store.dispatch(push('/home/login'));
                }
                return;
            }

            //only if we have received a non-error event do we reset the interval
            socketReconnectTimeout = BASE_CONNECT_MS;

            try{
                routeSocketMessage(data);
            } catch (err){
                console.error(err);
                socket.close();
            }
        });

        socket.addEventListener('error', function error(event){
            console.error(event);
        });

        socket.addEventListener('close', function close(event){
            console.log("Closed socket connection!");
            socketReconnectTimeout = Math.min(socketReconnectTimeout * 2, 300000);
            console.log("Doubling socket reconnection interval: ", socketReconnectTimeout);
            window.socket.isClosed = true;
        });

        window.socket = socket;
    };

    connectSocket();

}

const loader = new PIXI.Loader();
loader
    // 32px "Hot CoCo with T"
    .add('treasure', '/public/fnt/treasure.fnt')
    .load(main);

