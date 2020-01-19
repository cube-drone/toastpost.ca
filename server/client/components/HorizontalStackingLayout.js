const React = require('react');
import { Container } from '@inlet/react-pixi/dist/react-pixi.cjs';
const uuid = require('uuid/v4');

module.exports = ({children, defaultWidth=25, padding=10}) => {
   
    let width = 0;
    let stackedChildren = children.map((child)=>{
        let containedElement = <Container key={uuid()} position={[width, 0]}>
            {child}
        </Container>
        width += (child.props.width || defaultWidth) + padding;
        return containedElement;
    })

    return <Container>
        {stackedChildren}
    </Container>
};