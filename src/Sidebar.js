import React from 'react';
import "./Sidebar.css";
import {nodeTypes, layerNames} from "./ModelInfo.js";

function SidebarHeader(props) {
  const selectedClassName = "btn btn-dark btn-block";
  const unselectedClassName = "btn btn-outline-dark btn-block";
  return (
    <div className="sidebar-header">
        <button type="button" 
                className={props.tabSelected === "edit" ? selectedClassName : unselectedClassName }
                onClick={() => props.changeTab("edit")}>
                Edit
        </button>
        <button type="button" 
                className={props.tabSelected === "train" ? selectedClassName : unselectedClassName}
                onClick={() => props.changeTab("train")}>
                Train
        </button>
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

function Button(props) {
  return (
    <div className="p-2 align-self-stretch button-container">
      <button className="btn btn-dark btn-block" onClick={props.onClick}>
        {props.children}
      </button>
    </div>
  );
}

function Layer(props) {
  /* returns a button to create a layer */
  return (
    <Button onClick={() => props.newModel(props.name)}>
      {nodeTypes[props.name].name}
    </Button>
  )
}

function EditElements(props) {
  return (
    <React.Fragment>
      <p>Layers</p>
      <div className="d-flex flex-column">
      { layerNames.map((name) => 
        <Layer key={name}
          name={name}
          newModel={props.newModel}
        />)
      }
      </div>
    </React.Fragment>
  )
}

function TrainElements(props) {
  return (
    <React.Fragment>
      <p>Inputs</p>
      <Button>Some button for it</Button>

      <p>Model</p>
      <Button>Train on Cloud</Button>
      <Button>Generate Link</Button>
      <Button>Export</Button>
    </React.Fragment>
  )
}

function ElementsContainer(props) {
  const Elements = props.tabSelected === "edit" ? EditElements(props) : TrainElements(props)
  return (
    <ul className="list-unstyled components">
      {Elements}
    </ul>
  )
}

export class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      props: props,
      tabSelected: "edit", // which tab is selected
    };
    this.changeTab = this.changeTab.bind(this);
  }

  changeTab(tab) {
    /* updates the current tab selected */
    this.setState({
      tabSelected: tab
    })
  }

  render() {
    return (
      <nav className="p-2 h-100" id="sidebar">
        <SidebarHeader tabSelected={this.state.tabSelected} changeTab={this.changeTab} />
        <ElementsContainer tabSelected={this.state.tabSelected} newModel={this.state.props.newModel}/>
        <CTAList />
      
      </nav>
    )
  }
  
}