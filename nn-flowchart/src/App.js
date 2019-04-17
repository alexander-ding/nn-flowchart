import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import './App.css';

export class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      models: [],
      selected: 0,
      nextID: 0,
    };

    // function bindings
    this.newModel = this.newModel.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.selectModel = this.selectModel.bind(this);
  }

  model(type) {
    /* just a helper function */
    return {
      name: type + String(this.state.nextID),
      ID: this.state.nextID,
      type: type,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      connectedTo: null, // temp
      activation: null,
      data: {},
    }
  }

  newModel(type) {
    const oldModels = this.state.models.slice();
    const newModels = [...oldModels, this.model(type)];
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
    const models = this.state.models.slice();
    for (const key of Object.keys(dict)) {
      models[id][key] = dict[key];
    }
    this.setState({
      models: models,
    })
  }

  render() {
    return (
      <div className="container-fluid d-flex h-100 flex-row">
        <Sidebar newModel={this.newModel}/>
        <CanvasContainer models={this.state.models} selected={this.state.selected} select={this.selectModel} update={this.updateModel}/>
      </div>
      
    );
  }
}

export default App;
