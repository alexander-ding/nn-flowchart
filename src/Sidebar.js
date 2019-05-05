import React from 'react';
import "./Sidebar.css";
import {nodeTypes, layerNames, activationNames} from "./ModelInfo.js";

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

function Activation(props) {
  /* returns a button to append an activation */
  return (
    <Button onClick={() => props.newActivation(props.name)}>
      {nodeTypes[props.name].name}
    </Button>
  )
}

class EditElements extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.setActivation = this.setActivation.bind(this);
  }

  setActivation(name) {
    // must have a layer selected
    if (this.props.selected === -1) {
      this.props.setError("Select a layer to add the activation to first!", true);
      return;
    }
    const selected = this.props.models[this.props.selected]
    // cancel the existing activation if it's the same as this
    if (selected.activation === name) {
      this.props.update(this.props.selected, {
        activation: null,
      });
    } else {
      this.props.update(this.props.selected, {
        activation: name,
      });
    }
  }
  
  render() {
    return <React.Fragment>
      <p>Layers</p>
      <div className="d-flex flex-column">
      { layerNames.map((name) => 
        <Layer key={name}
          name={name}
          newModel={this.props.newModel}
        />)
      }
      </div>
      <p>Activations</p>
      <div className="d-flex flex-column">
      { activationNames.map((name) => 
        <Activation key={name} 
          name={name} 
          newActivation={() => this.setActivation(name)}
        />
        )
      }
      </div>
    </React.Fragment>
  }
}

function TrainElements(propOri) {
  const props = propOri.props;
  const trainButton = (!props.trainingInfo["training"]) ? 
                 <Button onClick={props.trainCloud}>Train on Cloud</Button> : 
                 <Button onClick={props.cancelTrain}>Cancel</Button>
  return (
    <React.Fragment>
      <p>Inputs</p>
      <Button>TODO</Button>
      
      <p>Model</p>
      {trainButton}
      <Button>Generate Link</Button>
      <Button>TODO-EXPORT</Button>
    </React.Fragment>
  )
}

function ElementsContainer(props) {
  const propsExtracted = props.props;
  const Elements = props.tabSelected === "edit" ? <EditElements models={propsExtracted.models} selected={propsExtracted.selected} setError={propsExtracted.setError} newModel={propsExtracted.newModel} update={propsExtracted.update}/>: <TrainElements props={propsExtracted}/>;
  return (
    <ul className="list-unstyled components">
      {Elements}
    </ul>
  )
}

export class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.props = props
    this.state = {
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
        <ElementsContainer tabSelected={this.state.tabSelected} props={this.props}/>
        <CTAList />
      
      </nav>
    )
  }
  
}