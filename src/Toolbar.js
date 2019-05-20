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

function DataInput(props) {
  return (
    <div className="parameter-line">
      <div className="parameter-name">Dataset</div>
      <div className="parameter-input parameter-clickable" onClick={props.setInputDataset}>{props.value}</div>
      
    </div>
  );
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
          <EditableLine name="Units" paraName="units" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,false)}/>
        </React.Fragment>
      );
    case "conv":
      return (
        <React.Fragment>
          <EditableLine name="Filters" paraName="filters" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,false)}/>
          <EditableLine name="Kernel Size" paraName="kernelSize" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,true)}/>
          <EditableLine name="Stride" paraName="stride" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,true)}/>
        </React.Fragment>
      )
    case "input":
      return (
        <React.Fragment>
          <DataInput value={model.parameters.data} setInputDataset={props.setInputDataset}></DataInput>
        </React.Fragment>
      )
    case "maxpool":
      return (
        <React.Fragment>
          <EditableLine name="Pool Size" paraName="poolSize" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,true)}/>
        </React.Fragment>
      )
    case "embedding":
      return (
        <React.Fragment>
          <EditableLine name="Units" paraName="units" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,false)}/>
        </React.Fragment>
      )
    case "dropout":
      return (
        <React.Fragment>
          <EditableLine name="Rate" paraName="rate" setEditableSelected={props.setEditableSelected} parameters={model.parameters} callback={(n,v)=>props.callback(n,v,false,true)}/>
        </React.Fragment>
      )
    default:
      return null;
  }
}

export function Toolbar(props) {
  if (props.selected === -1) {
    const modelInfo = props.modelInfo;
    const trainingInfo = props.trainingInfo;
    const loss = (trainingInfo.loss === null) ? "N/A" : trainingInfo.loss;
    const accuracy = (trainingInfo.accuracy === null) ? "N/A" : trainingInfo.accuracy;
    const testAccuracy = (trainingInfo.testAccuracy === null) ? "N/A" : trainingInfo.testAccuracy;
    const progress = (trainingInfo.progress === null) ? "0.0%" : trainingInfo.progress;
    return (
      <nav className="p-2 no-margin" id="toolbar">
        <div id="toolbar-container">
          <div className="left-line">
            <p>Model Information</p>
            <EditableLine name="Epochs" paraName="epochs" setEditableSelected={()=>null} parameters={modelInfo} callback={props.updateModelInfo}/>
            <EditableLine name="Batch Size" paraName="batchSize" setEditableSelected={()=>null} parameters={modelInfo} callback={props.updateModelInfo}/>
            <button onClick={props.trainSetup} className="btn btn-sm btn-light btn-block">More</button>
          </div>
          <div className="blocker"></div>
          <div className="middle-line">
            <p>Train Information</p>
            <DisplayLine name="Training" value={trainingInfo.training ? "Yes" : "No"}/>
            <DisplayLine name="Progress" value={progress}/>
          </div>
          <div className="blocker"></div>
          <div className="right-line">
            <br></br>
            <DisplayLine name="Accuracy" value={accuracy}/>
            <DisplayLine name="Loss" value={loss}/>
            <DisplayLine name="Test Acc" value={testAccuracy}/>
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
          <p>Parameters</p>
          <Parameters model={model} callback={props.update} setEditableSelected={props.setEditableSelected} setInputDataset = {props.setInputDataset}/>
        </div>
        <div className="blocker"></div>
        <div className="middle-line">
          <p>Layer Information</p>
          <DisplayLine name="Type" value={type}/>
          <DisplayLine name="Activation" value={activation}/>
        </div>
        <div className="blocker"></div>
        <div className="right-line">
          <br></br>
          <DisplayLine name="Shape In" value={incomingShape}/>
          <DisplayLine name="Shape Out" value={outgoingShape}/>
        </div>
      </div>
    </nav>
  )
}