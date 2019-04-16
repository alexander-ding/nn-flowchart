import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import './App.css';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.createNewBox = this.createNewBox.bind(this);
    this.state = {
      models: [],
      selected: 0,
      nextID: 0,
    }; // todo
    this.updateCoordinates = this.updateCoordinates.bind(this);
  }

  newModel(type) {
    return {
      name: type + String(this.state.nextID),
      ID: this.state.nextID,
      type: type,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      connectedTo: null,
      connectedFrom: null,
      activation: null,
      data: {},
    }
  }
  createNewBox(type) {
    const oldModels = this.state.models.slice();
    const newModels = [...oldModels, this.newModel(type)];
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
  updateCoordinates(id, x, y) {
    const models = this.state.models.slice()
    models[id].x = x;
    models[id].y = y;
    this.setState({
      models: models,
    })
  }

  render() {
    return (
      <div className="container-fluid d-flex h-100 flex-row">
        <Sidebar createNew={(name) => (() => this.createNewBox(name))}/>
        <CanvasContainer models={this.state.models} selected={this.state.selected} select={(id) => this.selectModel(id)} update={this.updateCoordinates}/>
      </div>
      
    );
  }
}

export default App;
