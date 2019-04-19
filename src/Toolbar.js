import React from "react";
import "./Toolbar.css";

function DisplayLine(props) {
  return (
    <div className="parameter-line">
      <div className="parameter-name">Name</div>
      <div className="parameter-value">Value</div>
    </div>
  )
}

export function Toolbar(props) {
  return (
    <nav className="p-2 no-margin" id="toolbar">
      <div className="container">
        <p>Toolbar</p>
        <div className="row">
          <DisplayLine></DisplayLine>
        </div>
      </div>
    </nav>
  )
}