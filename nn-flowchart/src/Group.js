import React from 'react';
import {nodeTypes} from "./Constants.js";

export class Group extends React.Component {
    constructor(props) {
      super(props);
      const model = this.props.model;
      this.state = {
        isDragging: false,
        initX: 0,
        initY: 0,
        initModelX: model.x,
        initModleY: model.y,
      }
      this.props = props;
      this.handleClick = this.handleClick.bind(this);
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
    }
  
    handleClick(e) {
      const model = this.props.model;
      this.props.select(model.ID);
      this.props.isClicked(this.props.model.ID);
    }
  
    onMouseDown(e) {
      const model = this.props.model;
      this.setState({
        isDragging: true,
        initX: e.clientX,
        initY: e.clientY,
        initModelX: model.x,
        initModelY: model.y
      });
      this.props.select(model.ID);
    }
  
    onMouseMove(e) {
      const model = this.props.model;
      if (this.state.isDragging) {
        const newX = e.clientX + this.state.initModelX - this.state.initX;
        const newY = e.clientY + this.state.initModelY - this.state.initY;
        this.props.update(model.ID, {x:newX, 
                                     y:newY});
      }
        // compute coordinates within svg
    }
  
    onMouseUp(e) {
      const model = this.props.model;
      const threshold = 10;
  
      this.setState({
        isDragging: false,
      });
      // if movement is small enough, consider it a click
      if (Math.abs(model.x - this.state.initModelX) + Math.abs(model.y - this.state.initModelY) < threshold) {
        this.handleClick(e);
      }
        
    }
  
    render() {
      const model = this.props.model;
  
      return (
        <g className={this.props.selected ? "selected" : ""}
          key={model.ID} 
          transform={"translate(" + String(model.x) + "," + String(model.y) + ")"}
          style={{userSelect: 'none'}} // to prevent selecting
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
        >
        {nodeTypes[model.type].svg(model)}
        </g>
      )
    }
    
  }