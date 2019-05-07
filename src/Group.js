import React from 'react';
import {nodeTypes} from "./ModelInfo.js";

export class Group extends React.Component {
    constructor(props) {
      super(props);
      this.props = props;
      this.onMouseDown = this.onMouseDown.bind(this);
    }
  
  
    onMouseDown(e) {
      const model = this.props.model;
      this.props.handleDrag(e.clientX, e.clientY, model.ID);
    }
  
  
    render() {
      const model = this.props.model;
  
      return (
        <g className={this.props.selected ? "selected" : ""}
          onMouseDown={this.onMouseDown}
          key={model.ID} 
          transform={"translate(" + String(model.x) + "," + String(model.y) + ")"}
          style={{userSelect: 'none'}} // to prevent selecting
        >
        {nodeTypes[model.type].svg(model)}
        </g>
      )
    }
    
  }