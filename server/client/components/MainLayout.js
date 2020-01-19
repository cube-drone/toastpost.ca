
const React = require('react');
const Switch = require('react-router-dom').Switch;
const Route = require('react-router-dom').Route;
const BrowserRouter = require('react-router-dom').BrowserRouter;
import { Stage, Container, BitmapText, Sprite, useTick } from '@inlet/react-pixi/dist/react-pixi.cjs';
const connect = require('react-redux').connect;
const Provider = require('react-redux').Provider;

const CRTContainer = require('./CRTContainer');
const LoadingScene = require('./LoadingScene');
const Metronome = require('./sound/Metronome');

const MainLayout = ({store, square, scale}) => {

  let width = square * 1.15; // 690px
  let height = square * 0.90; // 

  // our stage is 640x480
  // <Sprite image="/public/img/windy.png" x={0} y={0} width="640" height="480"></Sprite>

  // oh boooooooy
  // Normally, Provider/BrowserRouter are root-level elements
  //  BUT the context that they provide is incapable of piercing the Stage
  //  the react-pixi dev is convinced that this is a problem with React and not their problem
  //  and the only workaround is to define the Stage as the root-level element
  //  and have Provider and Router as elements just under that
  //  they should still be accessible everywhere within the tree, I think
  return <div style={{width: width, margin: "auto", paddingTop: "0.6%"}}>
    <Stage 
      width={width} 
      height={height} 
      options={{resolution: window.devicePixelRatio, autoDensity: true}}>
      <Provider store={store}>
        <BrowserRouter>
          <Metronome />
          <Container
            width={width}
            height={height}
            position={[0,0]}
            scale={scale}>
              <CRTContainer width={width} height={height} scale={scale} resolution={window.devicePixelRatio} chonkiness={0.5}>
                <Container position={[20, 35]}>
                    <Switch>
                      <Route path="/loading" component={LoadingScene}/>
                      <Route exact path="/" component={LoadingScene}/>
                    </Switch>
                </Container>
              </CRTContainer>
          </Container>
        </BrowserRouter>
      </Provider>
    </Stage>
  </div>
};

module.exports = connect((store, ownProps) => {
    return {
        store: ownProps.store, 
        square: store.window.square,
        scale: store.window.scale,
    }
})(MainLayout);