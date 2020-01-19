const React = require('react');
import { Container } from '@inlet/react-pixi/dist/react-pixi.cjs';
const uuid = require('uuid/v4');

module.exports = ({children, defaultHeight=25, padding=10}) => {
   
    let height = 0;
    let stackedChildren = children.map((child)=>{
        let containedElement = <Container key={uuid()} position={[0, height]}>
            {child}
        </Container>
        if(child.props){
            height += (child.props.height || defaultHeight) + padding;
        }
        else{
            height += defaultHeight + padding;
        }
        return containedElement;
    })

    return <Container>
        {stackedChildren}
    </Container>
};