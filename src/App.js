import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import {Toolbar} from "./Toolbar.js";
import {ErrorBox} from "./ErrorBox.js";
import {isCyclic, isLinear, isTrainable} from "./Utils.js";
import {nodeTypes} from "./ModelInfo.js";
import cloneDeep from 'lodash/cloneDeep';
import './App.css';

export class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      models: { // represent the architecture
        0: this._model("input", 0, 20, 50),
        1: this._model("output", 1, 300, 50)
      },
      selected: 0, // selected node;
      nextID: 2, // the ID for the next new layer; incremented as model grows
      errorMsg: null, // error message
      errorOnce: true, // is the error one-time or persistent?
      training: false, // whether the model is being trained on cloud
      editableSelected: false, // whether an editable element of the toolbar is selected
    };

    // function bindings
    this.newModel = this.newModel.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.selectModel = this.selectModel.bind(this);
    this.removeModel = this.removeModel.bind(this);
    this.setError = this.setError.bind(this);
    this.trainCloud = this.trainCloud.bind(this);
    this.setEditableSelected = this.setEditableSelected.bind(this);
  }

  
  _model(type, id, x, y) {
    return {
      name: type + String(id),
      ID: id,
      type: type,
      x: x,
      y: y,
      connectedTo: null,
      shapeIn: null, // dependent
      shapeOut: null, // dependent
      activation: null,
      parameters: cloneDeep(nodeTypes[type].defaultParameters),
    };
  }

  model(type) {
    return this._model(type, this.state.nextID, 10 + Math.random() * 80, 10 + Math.random() * 80);
  }

  updateDependents(models) {
    /* helper function to update members of nodes
     * that depend on other parts of the system 
     */

    // get the input model
    let inputNode = models[0];
    inputNode.shapeOut = nodeTypes[inputNode.type].shapeOut(inputNode.parameters, null);
    let currentNode = inputNode;
    let nextNode = models[inputNode.connectedTo];
    while (currentNode.connectedTo !== null) {
      nextNode.shapeIn = currentNode.shapeOut;
      nextNode.shapeOut = nodeTypes[nextNode.type].shapeOut(nextNode.parameters, nextNode.shapeIn);
      currentNode = nextNode;
      nextNode = models[nextNode.connectedTo];
    }
    return models;
  }

  newModel(type) {
    const oldModels = {...this.state.models};
    let newModels = {...oldModels, [this.state.nextID]: this.model(type)};
    newModels = this.updateDependents(newModels);
    this.setState({
      models: newModels,
      nextID: this.state.nextID + 1,
    });
  }

  selectModel(id) {
    this.setState({
      selected: id,
    })
  }

  updateModel(id, dict) {
    /* given a dict of properties to update ((name, value) pairs)
     * updates the model of the given id
     */
    let models = {...this.state.models};
    for (const key of Object.keys(dict)) {
      models[id][key] = dict[key];
    }
    if (isCyclic(models)) {
      this.setError("Graph cannot have loops", false)
    } else if (!isLinear(models)["ok"]) {
      this.setError(isLinear(models)["err"], false)
    } else {
      this.setError(null, false)
    }

    models = this.updateDependents(models);
    this.setState({
      models: models,
    });
    
  }

  removeModel(id) {
    /* given an id, removes the corresponding model
     * and all connections to it
     */

    // get filtered models
    let newModels = {};
    for (const key of Object.keys(this.state.models)) {
      if (this.state.models[key].ID !== id) {
        newModels[key] = this.state.models[key];
      }
    }

    for (const key of Object.keys(newModels)) {
      if (newModels[key].connectedTo === id) {
        newModels[key].connectedTo = null;
      }
    }

    newModels = this.updateDependents(newModels);
    this.setState({
      models: newModels,
    });
  }

  updateParameters(id, name, value) {
    /* given a dict of properties to update ((name, value) pairs)
     * updates the parameters of the model of the given id
     */
    // copy the model
    const model = {...this.state.models[id]};

    // now, important: check to ensure value is integer or tuple or integer
    let components = String(value).split(",");

    // do not accept empty inputs
    if (components.length === 0) {
      return;
    }
    for (var i = 0; i < components.length; i++) {
      const num = parseInt(components[i]);
      // do not update if any member of tuple is not a number
      if (isNaN(num)) {
        return;
      }
      components[i] = num;
    }
    // if tuple, set array
    if (components.length > 1) {
      model["parameters"][name] = components;
    } else {
      model["parameters"][name] = components[0];
    }
    let models = {...this.state.models}; // make a copy
    
    models[id] = model;
    models = this.updateDependents(models);
    this.setState({
      models: models,
    });
  }

  setError(err, once) {
    /* sets the error message */
    this.setState({
      errorMsg: err,
      errorOnce: once,
    });
  }
  
  setEditableSelected(t) {
    this.setState({
      editableSelected: t,
    });
  }

  trainCloud() {
    // first check if the model is linear
    const models = this.updateDependents(this.state.models);
    this.setState({
      models: models,
    })
    const resp = isTrainable(models);
    if (!resp["ok"]) {
      this.setError(resp["err"], true);
      return;
    }
    const serializedModel = JSON.stringify({
      modelJSON: JSON.stringify(models),
    });
    fetch('http://localhost:5000/api/Architecture', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: serializedModel
    }).then(response => {
      if (response.status === 201) {
        return response.json();
      } else {
        throw new Error("Something went wrong");
      }
    }).then((responseJSON) => {
      console.log(responseJSON);
    }).catch(e => {
      this.setError(e.message, true);
    });
    

    this.setState({
      training: true,
    })
  }

  render() {
    return (
      <React.Fragment>
        <ErrorBox errorMsg={this.state.errorMsg} dismissible={this.state.errorOnce} setError={this.setError}/>
        <div className="container-fluid d-flex h-100 flex-row no-margin">
          <Sidebar models={this.state.models} selected={this.state.selected} newModel={this.newModel} setError={this.setError} update={this.updateModel} trainCloud={this.trainCloud}/>
          <div className="d-flex w-100 p-2 flex-column flex-grow-1 no-margin" ref="canvasContainer">
            <CanvasContainer models={this.state.models} selected={this.state.selected} select={this.selectModel} update={this.updateModel} remove={this.removeModel} editableSelected={this.state.editableSelected}/>
            <Toolbar selected={this.state.selected} models={this.state.models} update={(name, value) => this.updateParameters(this.state.selected, name, value)} setEditableSelected={this.setEditableSelected}/>
          </div>
          
        </div>
      </React.Fragment>
      
    );
  }
}

export default App;
