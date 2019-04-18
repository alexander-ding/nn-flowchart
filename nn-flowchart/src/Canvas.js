import React from 'react';
import ReactDOM from 'react-dom';
import "./Canvas.css";
import {nodeTypes} from "./ModelInfo.js";
import {Group} from "./Group.js";
import {MarkerDefs, Line} from "./Line.js";
import {DELETE_KEY} from "./Constants.js";


function modelCenter(model) {
  /* get coordinates for the point on a model to connect to
   */
  const offsetX = nodeTypes[model.type].offsetX
  const offsetY = nodeTypes[model.type].offsetY
  return {x: model.x+offsetX, y: model.y+offsetY}
}

class Canvas extends React.Component {
  /* the class implementing the actual svg and all the event
   * listerers (along with its downstream elements)
   * stores the mouse locations and such information to implement
   * drag and drop
   */
  constructor(props) {
    super(props);
    this.props = props;
    
    this.state = {
      isNewline: false, // is there a new line being constructed?
      xOffset: 0, // offset of the svg's x from clientX
      yOffset: 0, // ibid for y
      x: 0, // x of the mouse relative to the svg
      y: 0, // ibid for y
      id: -1, // id of the line from which the current new line stems from
      selectedLineFromTo: [-1,-1], // selected line from node X to node Y ([X,Y])
    }

    // some function bindings
    this.handleElementClick = this.handleElementClick.bind(this);
    this.trackMouse = this.trackMouse.bind(this);
    this.handleBGClick = this.handleBGClick.bind(this);
    this.handleLineClick = this.handleLineClick.bind(this);
    this.deleteSelection = this.deleteSelection.bind(this);
  }

  componentDidMount() {
    // finds out the offsets of the svg
    const dim = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.setState({
      xOffset: dim.x,
      yOffset: dim.y,
    });

    // setup key listener for deletion
    document.addEventListener("keydown", this.deleteSelection);
  }

  componentWillUnmount() {
    // reset
    document.removeEventListener("keydown", this.deleteSelection);
  }

  deleteSelection(e) {
    if (e.keyCode === DELETE_KEY) {
      
    
      // prioritize items over line
      // if an item is selected
      if (this.props.selected !== -1) {
        // first cancel a few things just in case (to prevent errors)
        this.cancelNewline();
        const selected = this.props.selected
        this.props.select(-1);

        this.props.remove(selected);
        return;
      }
      const from = this.state.selectedLineFromTo[0];
      const to = this.state.selectedLineFromTo[1];
      if (from !== -1 || to !== -1) {
        this.cancelNewline();
        this.props.update(from, {
          connectedTo: null,
        });
        return;
      }
    }
  }

  startNewline(id) {
    /* starts the construction of a tentative new line */
    // cancel any existing line
    if (this.props.models[id].connectedTo !== null) {
      this.props.update(id, {
        connectedTo: null
      });
    }

    this.setState( {
      isNewline: true,
      id: id,
    });
  }

  cancelNewline() {
    /* cancels the tentative new line */
    this.setState({
      isNewline: false,
      id: -1,
      selectedLineFromTo: [-1, -1], // reset line selection
    })
  }

  trackMouse(e) {
    /* a helper function to keep tracking mouse movement */
    this.setState({
      x: e.clientX - this.state.xOffset,
      y: e.clientY - this.state.yOffset,
    });
  }

  handleBGClick(e) {
    /* handles a click on the background */
    if (e.target === this.refs.canvas) {
      this.props.select(-1); // deselect elements
      this.cancelNewline();
      return;
    }
    // the rest is handled on handleElementClick
  }

  handleElementClick(id) {
    /* handles a click to one of the elemnts, to be passed
     * to the child classes of the canvas
     */
    // if this is a new line, clicked on another object
    if (this.state.isNewline) {
      if (this.state.id !== id) {
        // update model so that new connection is made
        this.props.update(this.state.id, {
          connectedTo: id,
        })
      }
      // remove temporary line
      this.cancelNewline();
      return;
    }
    // if no current line, start one
    this.startNewline(id);
  }

  handleLineClick(idFrom, idTo) {
    /* handles a click on the line, to be passed
     * to the child class
     */
    this.setState({
      selectedLineFromTo: [idFrom, idTo]
    })
    this.props.select(-1);
  }

  render() {
    // let's do all the layers from the model first
    const modelElements = Object.entries(this.props.models).map(([key, model]) => 
      <Group key={model.ID} model={model} select={this.props.select} selected={this.props.selected===model.ID} update={this.props.update} isClicked={this.handleElementClick}/>
    );
    
    // this part handles rendering the tentative line (if any)
    let tentativeLine = null;
    if (this.state.isNewline) {
      const coords = modelCenter(this.props.models[this.state.id]);
      tentativeLine = <Line tentative={true} selected={true} x1={coords.x} y1={coords.y} x2={this.state.x} y2={this.state.y}/>
    }

    // renders all the lines between models
    const lines = Object.entries(this.props.models).map(([index, model]) => {
      // no line if there is no connection
      if (model.connectedTo === null) {
        return null;
      }
      const otherModel = this.props.models[model.connectedTo];
      const coords = modelCenter(model);
      const otherCoords = modelCenter(otherModel);
      const selected = this.state.selectedLineFromTo[0]===model.ID && this.state.selectedLineFromTo[1] === otherModel.ID;

      return <Line key={index} tentative={false} selected={selected} x1={coords.x} y1={coords.y} x2={otherCoords.x} y2={otherCoords.y} onClick={() => this.handleLineClick(model.ID, otherModel.ID)}></Line>
    })

    return (
      // stick a rect for background
      <svg onClick={this.handleBGClick} onMouseMove={this.trackMouse} id="canvas" width="100%" height="60%" ref="canvas">
        <MarkerDefs/>
        <rect width="100%" height="100%" fill="#b477ec" pointerEvents="none"/>
        {modelElements}
        {lines}
        {tentativeLine}
      </svg>
    )
  }
  
}

function Padding(props) {
  /* just padding to make the main canvas look better */
  return (
    <svg width="100%" height="20%">
      <rect width="100%" height="100%" fill="blueviolet"/>
    </svg>
  )
}

export function CanvasContainer(props) {
  /* contains the main section of the page yay */
  return (
    // padding on top and below to look extra good
    <div className="p-2 flex-grow-1 canvas-container"> 
      <Padding/>
      <Canvas models={props.models} selected={props.selected} select={props.select} update={props.update} remove={props.remove}/>
      <Padding/>
    </div>
  );
}