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
    // handles: 
    // onFocus -- reports to parent that editable is selected
    // onChange -- updates and stores internal value
    // onBlur -- callbacks to update the model and reset the internal state
    this.onFocus = () => this.props.setEditableSelected(true);
    this.onChange = this.onChange.bind(this);
    this.onBlur = (value) => {
      this.setState({
        valueChanged: false,
        currentValue: null,
      });
      this.props.setEditableSelected(false);
      this.props.callback(this.props.paraName, value);
    };
  }

  onChange(event) {
    const value = event.target.value;

    this.setState({
      valueChanged: true,
      currentValue: value,
    });
  }

  render() {
    const oldValue = this.props.parameters[this.props.paraName];
    const value = (this.state.valueChanged ? this.state.currentValue : oldValue);

    return (
      <div className="parameter-line">
        <div className="parameter-name">{this.props.name}</div>
        <input className="parameter-input" onFocus={this.onFocus} onBlur={() => this.onBlur(value)} onChange={this.onChange} value={value}></input>
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
          <EditableLine name="Units" paraName="units" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={props.callback}/>
        </React.Fragment>
      );
    case "conv":
      return (
        <React.Fragment>
          <EditableLine name="Filters" paraName="filters" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={props.callback}/>
          <EditableLine name="Kernel Size" paraName="kernelSize" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={props.callback}/>
          <EditableLine name="Stride" paraName="stride" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={props.callback}/>
        </React.Fragment>
      )
    case "input":
      return (
        <React.Fragment>
          <EditableLine name="Batch Size" paraName="batchSize" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={props.callback}/>
        </React.Fragment>
      )
    default:
      return null;
  }
}

export function Toolbar(props) {
  if (props.selected === -1) {
    const modelInfo = props.modelInfo
    return (
      <nav className="p-2 no-margin" id="toolbar">
        <div id="toolbar-container">
          <div className="left-line">
            <p>Model Information</p>
            <EditableLine name="Epochs" paraName="epochs" setEditableSelected={()=>null} parameters={modelInfo} callback={props.updateModelInfo}/>
          </div>
          <div className="middle-line">
            <p>Train Information</p>
            
          </div>
        </div>
      </nav>
    )
  }
  const model = props.models[props.selected];

  const type = nodeTypes[model.type].name;
  const activation = (model.activation === null) ? "None" : nodeTypes[model.activation].name;
  const incomingShape = (model.shapeIn === null ? "N/A" : String(model.shapeIn));
  const outgoingShape = (model.shapeOut === null ? "N/A" : String(model.shapeOut));
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
          <Parameters model={model} callback={props.update} setEditableSelected={props.setEditableSelected}/>
        </div>
      </div>
    </nav>
  )
}