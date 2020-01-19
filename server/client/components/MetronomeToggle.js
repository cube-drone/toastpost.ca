const React = require('react');
import { Container } from '@inlet/react-pixi/dist/react-pixi.cjs';
const connect = require('react-redux').connect;

const MetronomeToggle = ({children, ticks}) => {
    //console.log(ticks, children.length, ticks % children.length)
    return <Container>
        {children[ticks % children.length]}
    </Container>
};

module.exports = connect((store)=>{
    return {
        ticks: store.metronome.ticks,
    }
})(MetronomeToggle);