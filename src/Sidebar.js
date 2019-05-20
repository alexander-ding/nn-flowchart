import React from 'react';
import Collapsible from 'react-collapsible';
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
        <a href="https://www.github.com/alexding123/NN-Flowchart" className="download">Download source</a>
      </li>
    </ul>
  )
}

function Button(props) {
  return (
    <div className="p-2 align-self-stretch button-container">
      <button className="btn btn-sm btn-dark btn-block" onClick={props.onClick} disabled={props.disabled}>
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
  );
}

class EditElements extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.propsOri = props.propsOri;
    this.setActivation = this.setActivation.bind(this);
  }

  setActivation(name) {
    // must have a layer selected
    if (this.props.selected === -1) {
      this.props.setError("Select a layer to add the activation to first!", true);
      return;
    }
    const selected = this.props.models[this.props.selected];

    // cancel activation if model is not activation-capatible
    if (!nodeTypes[selected.type].canActivation) {
      return;
    }
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
    const triggerName = "btn btn-dark btn-block";
    return <React.Fragment>
      <Collapsible trigger="Layers" triggerTagName="button" triggerClassName={triggerName} triggerOpenedClassName={triggerName} onOpen={() => this.propsOri.update("layers", false)} onClose={() => this.propsOri.update("layers", true)} open={!this.propsOri.layersCollapsed}>
        <div className="d-flex flex-column">
        { layerNames.map((name) => 
          <Layer key={name}
            name={name}
            newModel={this.props.newModel}
          />)
        }
        </div>
      </Collapsible>
      <Collapsible trigger="Activations" triggerTagName="button" triggerClassName={triggerName} triggerOpenedClassName={triggerName} onOpen={() => this.propsOri.update("activations", false)} onClose={() => this.propsOri.update("activations", true)} open={!this.propsOri.activationsCollapsed}>
      <div className="d-flex flex-column">
      { activationNames.map((name) => 
        <Activation key={name} 
          name={name} 
          newActivation={() => this.setActivation(name)}
        />
        )
      }
      </div>
      </Collapsible>
    </React.Fragment>
  }
}

function TrainElements(propOri) {
  const props = propOri.props;
  const isTraining = props.trainingInfo["training"];
  const trainButton = (!isTraining) ? 
                 <Button onClick={props.trainCloud}>Train on Cloud</Button> : 
                 <Button onClick={props.cancelTrain}>Cancel</Button>;
  return (
    <React.Fragment>
      <p>Server</p>
      <Button onClick={props.setSelectModelPage} disabled={isTraining}>New/Load</Button>
      <Button onClick={props.getLink}>Generate Link</Button>
      
      <p>Model</p>
      {trainButton}
      <Button onClick={props.downloadModel}>Download Model</Button>

      <p>Input</p>
      <Button onClick={props.setInput}>Set Input</Button>
      
    </React.Fragment>
  )
}

function ElementsContainer(props) {
  const propsExtracted = props.props;
  const Elements = props.tabSelected === "edit" ? <EditElements propsOri={props} models={propsExtracted.models} selected={propsExtracted.selected} setError={propsExtracted.setError} newModel={propsExtracted.newModel} update={propsExtracted.update}/>: <TrainElements props={propsExtracted}/>;
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
      layersCollapsed: false,
      activationsCollapsed: false,
    };
    this.changeTab = this.changeTab.bind(this);
    this.set = this.set.bind(this);
  }

  set(name, v) {
    if (name === "layers") {
      this.setState({layersCollapsed: v});
    } else if (name === "activations") {
      this.setState({activationsCollapsed: v});
    }
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
        <ElementsContainer tabSelected={this.state.tabSelected} layersCollapsed={this.state.layersCollapsed} activationsCollapsed={this.state.activationsCollapsed} update={this.set} props={this.props}/>
        <CTAList />
      
      </nav>
    )
  }
  
}