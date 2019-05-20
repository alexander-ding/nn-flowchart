import React from "react";
import "./TrainSetup.css";

function Option(props) {
  const className = (props.selected === props.name) ? "btn btn-info" : "btn btn-secondary"
  return (
    <div className="p-2">
      <button type="button" onClick={() => props.select(props.name)} className={className}>{props.displayName}</button>
    </div>
  )
}

export class TrainSetup extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    if (e.target.id === "background-input-set") {
      this.props.toggle();
    }
  }

  render() {
    if (!this.props.display) {
      return null;
    }
    return (
      <div id="background-input-set" className="set-input-container" onClick={this.onClick}>
      <h1>Setup Training Details</h1>
      <div className="input-container">
        <div className="input-preset">
          <h2>Optimizer</h2>
          <div>
            Learning Rate: <input id="learning-rate" type="number" step="any" value={this.props.modelInfo.learningRate} onChange={() => this.props.update("learningRate", parseFloat(document.getElementById("learning-rate").value))} min="0"></input>
          </div>
          <div className="d-flex flex-wrap p-2">
            <Option name="adam" displayName="Adam" selected={this.props.modelInfo.optimizer} select={(v)=>this.props.update("optimizer", v)}></Option>
            <Option name="sgd" displayName="SGD" selected={this.props.modelInfo.optimizer} select={(v)=>this.props.update("optimizer", v)}></Option>
            <Option name="rmsProp" displayName="RMS Prop" selected={this.props.modelInfo.optimizer} select={(v)=>this.props.update("optimizer", v)}></Option>
          </div>
        </div>

        <div id="input-blocker" className="input-blocker"></div>
        <div className="input-load">
          <h2>Loss</h2>
          <div className="d-flex flex-wrap p-2">
            <Option name="mse" displayName="Mean Squared Error" selected={this.props.modelInfo.loss} select={(v)=>this.props.update("loss", v)}></Option>
            <Option name="logcosh" displayName="Log Cosh" selected={this.props.modelInfo.loss} select={(v)=>this.props.update("loss", v)}></Option>
            <Option name="cce" displayName="Categorical Crossentropy" selected={this.props.modelInfo.loss} select={(v)=>this.props.update("loss", v)}></Option>
          </div>
        </div>
      </div>
      </div>
      );
    }
}