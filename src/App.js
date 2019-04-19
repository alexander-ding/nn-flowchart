import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import {Toolbar} from "./Toolbar.js";
import './App.css';

export class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      models: {},
      selected: 0,
      nextID: 0,
    };

    // function bindings
    this.newModel = this.newModel.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.selectModel = this.selectModel.bind(this);
    this.removeModel = this.removeModel.bind(this);
  }

  model(type) {
    /* just a helper function */
    return {
      name: type + String(this.state.nextID),
      ID: this.state.nextID,
      type: type,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      connectedTo: null,
      activation: null,
      data: {},
    }
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

  render() {
    return (
      <div className="container-fluid d-flex h-100 flex-row no-margin">
        <Sidebar newModel={this.newModel}/>
        <div className="d-flex w-100 p-2 flex-column flex-grow-1 no-margin">
          <CanvasContainer models={this.state.models} selected={this.state.selected} select={this.selectModel} update={this.updateModel} remove={this.removeModel}/>
          <Toolbar/>
        </div>
        
      </div>
      
    );
  }
}

export default App;
