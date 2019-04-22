import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import {Toolbar} from "./Toolbar.js";
import {ErrorBox} from "./ErrorBox.js";
import {isCyclic, isLinear} from "./Utils.js";
import './App.css';

export class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      models: {
        0: this._model("input", 0, 20, 50),
        1: this._model("output", 1, 300, 50)},
      selected: 0,
      nextID: 2,
      errorMsg: null,
      errorOnce: true,
    };

    // function bindings
    this.newModel = this.newModel.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.selectModel = this.selectModel.bind(this);
    this.removeModel = this.removeModel.bind(this);
    this.setError = this.setError.bind(this);
  }

  
  _model(type, id, x, y) {
    return {
      name: type + String(id),
      ID: id,
      type: type,
      x: x,
      y: y,
      connectedTo: null,
      activation: null,
      data: {},
    };
  }
  model(type) {
    return this._model(type, this.state.nextID, 10 + Math.random() * 80, 10 + Math.random() * 80);
  }

  newModel(type) {
    const oldModels = {...this.state.models};
    const newModels = {...oldModels, [this.state.nextID]: this.model(type)};
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
    const models = {...this.state.models};
    for (const key of Object.keys(dict)) {
      models[id][key] = dict[key];
    }
    if (isCyclic(models)) {
      this.setError("Graph cannot have loops", false)
    } else if (!isLinear(models)) {
      this.setError("Graph must be linear!", false)
    } else {
      this.setError(null, false)
    }
    this.setState({
      models: models,
    })
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

    this.setState({
      models: newModels,
    })
  }

  setError(err, once) {
    /* sets the error message */
    this.setState({
      errorMsg: err,
      errorOnce: once,
    })
  }

  render() {
    const selectedModel = this.state.selected === -1 ? null : this.state.models[this.state.selected];
    return (
      <React.Fragment>
        <ErrorBox errorMsg={this.state.errorMsg} dismissible={this.state.errorOnce} setError={this.setError}/>
        <div className="container-fluid d-flex h-100 flex-row no-margin">
          <Sidebar models={this.state.models} selected={this.state.selected} newModel={this.newModel} setError={this.setError} update={this.updateModel} />
          <div className="d-flex w-100 p-2 flex-column flex-grow-1 no-margin" ref="canvasContainer">
            <CanvasContainer models={this.state.models} selected={this.state.selected} select={this.selectModel} update={this.updateModel} remove={this.removeModel}/>
            <Toolbar model={selectedModel}/>
          </div>
          
        </div>
      </React.Fragment>
      
    );
  }
}

export default App;
