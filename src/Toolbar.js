import React from "react";
import "./Toolbar.css";
import {nodeTypes} from "./ModelInfo.js";

function DisplayLine(props) {
  /* Returns a line of view-only parameter */
  return (
    <div className="parameter-line">
      <div className="parameter-name">{props.name}:</div>
      <div className="parameter-value">{props.value}</div>
    </div>
  )
}

class EditableLine extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      valueChanged: false,
      currentValue: null,
    };
    // handles both: 
    // onChange -- updates and stores internal value
    // onBlur -- callbacks to update the model
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.setState({
      valueChanged: true,
      currentValue: event.target.value,
    });
  }

  render() {
    const value = (this.state.valueChanged ? this.state.currentValue : this.props.value);
    return (
      <div className="parameter-line">
        <div className="parameter-name">{this.props.name}</div>
        <input className="parameter-input" onBlur={() => this.props.callback(value)} onChange={this.onChange} value={value}></input>
      </div>
    )
  }
  
}

function Parameters(props) {
  /* Returns a list of lines of editable parameters */
  const model = props.model;
  if (model === null) {
    return null;
  }
  switch (model.type) {
    case "dense":
      return (
        <React.Fragment>
        <EditableLine name="Units" callback={(value) => props.callback("units" , value)} value={model.parameters["units"]}/>
        </React.Fragment>
      );
    default:
      return null;
  }
}

export function Toolbar(props) {
  const model = props.model;
  let type = "N/A";
  let activation = "N/A";
  let incomingShape = "N/A";
  let outgoingShape = "N/A";

  // set the values if model is selected
  if (model !== null) {
    type = nodeTypes[model.type].name;
    activation = (model.activation === null) ? "None" : nodeTypes[model.activation].name;
  }
  return (
    <nav className="p-2 no-margin" id="toolbar">
      <div id="toolbar-container">
        
        <div className="left-line">
          <p>Layer Information</p>
          <DisplayLine name="Type" value={type}/>
          <DisplayLine name="Activation" value={activation}/>
        </div>
        <div className="middle-line">
          <br></br>
          <DisplayLine name="Shape In" value={incomingShape}/>
          <DisplayLine name="Shape Out" value={outgoingShape}/>
        </div>
        <div className="right-line">
          <p>Parameters</p>
          <Parameters model={model} callback={props.update}/>
        </div>
      </div>
    </nav>
  )
}