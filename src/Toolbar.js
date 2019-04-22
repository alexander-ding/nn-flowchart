import React from "react";
import "./Toolbar.css";
import {nodeTypes} from "./ModelInfo.js";

function DisplayLine(props) {
  return (
    <div className="parameter-line">
      <div className="parameter-name">{props.name}:</div>
      <div className="parameter-value">{props.value}</div>
    </div>
  )
}

export function Toolbar(props) {
  const model = props.model;
  let type = "N/A";
  let id = "N/A";
  let activation = "N/A";

  // set the values if model is selected
  if (model !== null) {
    type = nodeTypes[model.type].name;
    id = model.ID;
    activation = (model.activation === null) ? "None" : nodeTypes[model.activation].name;
  }
  return (
    <nav className="p-2 no-margin" id="toolbar">
      <div id="toolbar-container">
        <p>Layer Information</p>
        <div className="left-line">
          <DisplayLine name="Type" value={type}/>
          <DisplayLine name="ID" value={id}/>
          <DisplayLine name="Activation" value={activation}/>
        </div>
        <div className="right-line">
          <DisplayLine name="Name" value={1}/>
        </div>
      </div>
    </nav>
  )
}