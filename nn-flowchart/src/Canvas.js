import React from 'react';
import "./Canvas.css";
import {nodeTypes} from "./Constants.js";

class Group extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
      initX: 0,
      initY: 0,
    }
    this.props = props;
  }
  render() {
    const model = this.props.model;

    const selected = (this.props.selected === model.ID);

    const onMouseDown = (e) => {
      this.setState({
        isDragging: true,
        initX: model.x - e.clientX,
        initY: model.y - e.clientY,
      })
      this.props.select(model.ID);
    };

    const onClick = (e) => {
      // TODO: handle line dropping
    }

    return (
      <g className={selected ? "selected" : ""}
        key={model.ID} 
        transform={"translate(" + String(model.x) + "," + String(model.y) + ")"}
        style={{userSelect: 'none'}} // to prevent selecting
        onMouseDown={onMouseDown}
        onMouseMove={e => {
          if (this.state.isDragging) {
            const newX = e.clientX + this.state.initX;
            const newY = e.clientY + this.state.initY;
            this.props.update(model.ID, newX, newY);
          }
          // compute coordinates within svg
          
        }}
        onMouseUp={() => {
          this.setState({
            isDragging: false,
          });
        }} 
      >
        {nodeTypes[model.type].svg(model)}
      </g>)
  }
  
}

function Canvas(props) {
  const modelElements = props.models.map(model => 
    <Group key={model.ID} model={model} select={props.select} selected={props.selected} update={props.update}/>
  );
  const onClick = (e) => {
    props.select(-1); // unselect all
  }
  return (
    // stick a rect for background
    <svg onClick={onClick} id="canvas" width="100%" height="60%">
      <rect width="100%" height="100%" fill="#b477ec"/>
      {modelElements}
    </svg>
  )
}

function Padding(props) {
  return (
    <svg width="100%" height="20%">
      <rect width="100%" height="100%" fill="blueviolet"/>
    </svg>
  )
}

export function CanvasContainer(props) {
  return (
    <div className="p-2 flex-grow-1 canvas-container"> 
      <Padding></Padding>
      <Canvas models={props.models} selected={props.selected} select={props.select} update={props.update}/>
      <Padding/>
    </div>
  );
}