import React from 'react';
import "./Sidebar.css";
import {nodeTypes, layerNames} from "./Constants.js";

function SidebarHeader(props) {
  return (
    <div className="sidebar-header">
        <button type="button" className="btn btn-dark btn-block">Add</button>
        <button type="button" className="btn btn-outline-dark btn-block">Train</button>
    </div>
  )
}

function CTAList() {
  return (
    <ul className="list-unstyled CTAs">
      <li>
        <a href="www.github.com/alexding123/NN-Flowchart" className="download">Download source</a>
      </li>
    </ul>
  )
}

function Layer(props) {

  return (
    <div className="p-2 align-self-stretch button-container">
      <button className="btn btn-dark btn-block" onClick={() => props.newModel(props.name)}>
        {nodeTypes[props.name].name}
      </button>
    </div>
  );
}

function ElementsContainer(props) {
  return (
    <ul className="list-unstyled components">
      <p>Layers</p>
      <div className="d-flex flex-column">
      { layerNames.map((name) => 
        <Layer key={name}
          name={name}
          newModel={props.newModel}
        />)
      }
      </div>
    </ul>
  )
}

export function Sidebar(props) {
  return (
    <nav id="sidebar">
      <SidebarHeader />

      <ElementsContainer newModel={props.newModel}/>
      <CTAList />
    
    </nav>
  )
}