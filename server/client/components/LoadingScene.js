
const React = require('react');
import { Container, BitmapText, Sprite, useTick } from '@inlet/react-pixi/dist/react-pixi.cjs';
const connect = require('react-redux').connect;
import * as PIXI from 'pixi.js';

const VerticalStackingLayout = require("./VerticalStackingLayout");
const HorizontalStackingLayout = require('./HorizontalStackingLayout');
const MetronomeToggle = require('./MetronomeToggle');

const {partiallyLoaded, fullyLoaded} = require('../actions/loading');


const loader = PIXI.Loader.shared; 

let assets = {
  "300test": "public/img/300test.png",
  "450test": "public/img/450test.png",
  "600test": "public/img/600test.png",
  "nge": "public/img/arizona-nge.jpg",
  "drs86": "public/image/drs86.png",
};

class LoadingScene extends React.Component {
  
    componentDidMount() {
      console.warn("Loading assets!");
      let that = this;

      // load all assets
      Object.keys(assets).map(key=>{
        loader.add(key, assets[key]);
      })

      loader.onProgress.add((loader, resource)=>{
        console.log(`Loaded ${resource.url}`);
        that.props.dispatch(partiallyLoaded(resource));
      });

      loader.onError.add((loader, resource)=>{
        console.error(`Problem loading: ${resource.url}`);
      });

      loader.load((loader, resources) => {
          // resources is an object where the key is the name of the resource loaded and the value is the resource object.
          // They have a couple default properties:
          // - `url`: The URL that the resource was loaded from
          // - `error`: The error that happened when trying to load (if any)
          // - `data`: The raw data that was loaded
          // also may contain other properties based on the middleware that runs.
          //sprites.bunny = new PIXI.TilingSprite(resources.bunny.texture);
          that.props.dispatch(fullyLoaded(resources));
          console.log("fully loaded");
      });
    }

    render() {
      let {numberOfAssetsLoaded, fullyLoaded, metronomeActive} = this.props;

      let loadingAnimation = <MetronomeToggle width={6} height={18}>
        <BitmapText
          anchor={0}
          text={".  "}
          style={{ font: '18px Hot CoCo with T' }}
        />
        <BitmapText
          anchor={0}
          text={" . "}
          style={{ font: '18px Hot CoCo with T' }}
        />
        <BitmapText
          anchor={0}
          text={"  ."}
          style={{ font: '18px Hot CoCo with T' }}
        />
      </MetronomeToggle>

      let loadingCompletion = loadingAnimation;
      if(fullyLoaded){
        loadingCompletion = <BitmapText
          anchor={0}
          text="Complete"
          height={18}
          width={11.3*8}
          style={{ font: '18px Hot CoCo with T' }}
        />
      }

      let metronomeCompletion = <BitmapText
          anchor={0}
          text="Please click to activate system clock ..."
          height={18}
          width={11.3 * 42}
          style={{ font: '18px Hot CoCo with T' }}
        />
      if(metronomeActive){
        metronomeCompletion = <MetronomeToggle height={18}>
                <BitmapText
                  anchor={0}
                  text={"Reticulating Splines"}
                  height={18}
                  style={{ font: '18px Hot CoCo with T' }}
                />
                <BitmapText
                  anchor={0}
                  text={"Greeting World"}
                  height={18}
                  style={{ font: '18px Hot CoCo with T' }}
                />
                <BitmapText
                  anchor={0}
                  text={"Broaching Topics"}
                  height={18}
                  style={{ font: '18px Hot CoCo with T' }}
                />
        </MetronomeToggle>
      }

      let connectingCompletion = <HorizontalStackingLayout height={18}>
        <BitmapText
          anchor={0}
          text={"Connecting"}
          height={18}
          width={11.3*10}
          style={{ font: '18px Hot CoCo with T' }}
        />
        {loadingAnimation}
      </HorizontalStackingLayout>

      return <Container position={[0, 25]}>
            <VerticalStackingLayout padding={3}>
              <BitmapText
                anchor={0}
                text={`Memtest ${numberOfAssetsLoaded * 128}KB`}
                height={18}
                style={{ font: '18px Hot CoCo with T' }}
              />
              <HorizontalStackingLayout height={18}>
                <BitmapText
                  anchor={0}
                  text={"Loading"}
                  width={11.3*7}
                  style={{ font: '18px Hot CoCo with T' }}
                />
                {loadingCompletion}
              </HorizontalStackingLayout>
              <Container height={18}>
                {connectingCompletion}
              </Container>
              <Container height={18}>
                {metronomeCompletion}
              </Container>
            </VerticalStackingLayout>
        </Container>

    }
}

module.exports = connect((store)=>{
    return {
        fullyLoaded: store.loading.fullyLoaded,
        numberOfAssetsLoaded: store.loading.numberOfAssetsLoaded,
        metronomeActive: store.metronome.active,
    }
})(LoadingScene);