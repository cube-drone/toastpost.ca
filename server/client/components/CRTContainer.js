const React = require('react');
import { Container as PixiContainer } from 'pixi.js'
import { PixiComponent, useTick} from '@inlet/react-pixi/dist/react-pixi.cjs';
import { AdvancedBloomFilter, CRTFilter, PixelateFilter, RGBSplitFilter, GlitchFilter, BulgePinchFilter } from 'pixi-filters';

let pixelateFilter = new PixelateFilter();
let bloomFilter = new AdvancedBloomFilter({
    threshold: 0.5,
    bloomScale: 0.5,
    brightness: 0.5,
    blur: 0.5,
    quality: 50,
    pixelSize: 0.25,
});
let rgbFilter = new RGBSplitFilter([-2, 0], [0, 2], [0, -2]);
let glitchFilter = new GlitchFilter({
    slices: 5,
    offset: 100,
    direction: 0,
    fillMode: 0,  // 0 TRANSPARENT, 1 ORIGINAL, 2 LOOP, 3 CLAMP, 4 MIRRIR
    seed: 0,
    average: false,
    minSize: 8,
    sampleSize: 512,
    red: [-10, 0],
    green: [0, 10],
    blue: [0, 0],
});
let crtFilter = new CRTFilter({
    curvature: 1,
    lineContrast: 0.05, 
    lineWidth:1,
    verticalLine: false,
    seed: 0,
    noise: 0.1,
    noiseSize: 0.5,
    vignetting: 0.1,
    vignettingAlpha: 0.3,
    vignettingBlur: 0.1,
});


let CRTContainer = PixiComponent('CRTContainer', {
  create: props => {
    return new PixiContainer()
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    const {width, height, scale, resolution, chonkiness=1, time=0} = newProps
    pixelateFilter.size = scale * resolution * chonkiness;
    bloomFilter.pixelSize = pixelateFilter.size;
    crtFilter.time = time;
    //glitchFilter.seed = time % 10;
    const filters = [
        pixelateFilter,
        rgbFilter,
        bloomFilter,
        crtFilter,
    ];
    instance.filters = filters;
  },
})

module.exports = ({width, height, scale, resolution, chonkiness, children}) => {
    const [time, setTime] = React.useState(0);
    
    // custom ticker
    useTick(delta => {
        //if(window.transport){
            setTime(time + 1)
        //}
    });

    return <CRTContainer width={width} height={height} scale={scale} resolution={resolution} chonkiness={chonkiness} time={time}>
        {children}
    </CRTContainer>
};
