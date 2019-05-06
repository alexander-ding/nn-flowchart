import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import {Toolbar} from "./Toolbar.js";
import {ErrorBox} from "./ErrorBox.js";
import {SelectModel} from "./SelectModel.js";
import {LinkPage} from "./LinkPage.js";
import {isCyclic, isLinear, isTrainable} from "./Utils.js";
import {nodeTypes} from "./ModelInfo.js";
import {saveModel, startSession, updateTrain, deleteTrain, generateLink} from "./Server.js";
import cloneDeep from 'lodash/cloneDeep';
import './App.css';

export class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      models: { // represent the architecture
        0: this._model("input", 0, 20, 50),
        1: this._model("output", 1, 300, 50),
      },
      modelInfo: {
        epochs: "2",
        // loss
        // optimizer
      },
      selected: 0, // selected node;
      nextID: 2, // the ID for the next new layer; incremented as model grows
      errorMsg: null, // error message
      errorOnce: false,
      trainingInfo: {
        accuracy: null,
        testAccuracy: null,
        loss: null,
        progress: null,
        training: false, // whether the model is being trained on cloud
      },
      modelID: null, // ID of the model
      sessionID: null, // ID of the training session
      intervalID: null, // ID of the interval to be set
      editableSelected: false, // whether an editable element of the toolbar is selected
      selectModelPage: true, // is it in the page selecting model or main page
      linkPage: false, // is link page on display
      link: null, // the link for the current model
    };

    // function bindings
    this.newModel = this.newModel.bind(this);
    this.updateModel = this.updateModel.bind(this);
    this.selectModel = this.selectModel.bind(this);
    this.removeModel = this.removeModel.bind(this);

    this.setEditableSelected = this.setEditableSelected.bind(this);
    this.updateModelInfo = this.updateModelInfo.bind(this);
    this.setError = this.setError.bind(this);

    this.trainCloud = this.trainCloud.bind(this);    
    this.startSession = this.startSession.bind(this);
    this.updateTrain = this.updateTrain.bind(this);
    this.cancelTrain = this.cancelTrain.bind(this);
    this.state["models"] = this._updateDependents(this.state.models);

    this.loadDefaultModel = this.loadDefaultModel.bind(this);
    this.loadModel = this.loadModel.bind(this);

    this.getLink = this.getLink.bind(this);
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
    this.setError(null, false);
    return this._updateDependents(models);
  }
  _updateDependents(models) {
    /* helper function to update members of nodes
     * that depend on other parts of the system 
     */
    // get the input model
    let inputNode = models[0];
    inputNode.shapeOut = nodeTypes[inputNode.type].shapeOut(inputNode.parameters, null, this.setError);
    let currentNode = inputNode;
    let nextNode = models[inputNode.connectedTo];
    while (currentNode.connectedTo !== null) {
      nextNode.shapeIn = currentNode.shapeOut;
      nextNode.shapeOut = nodeTypes[nextNode.type].shapeOut(nextNode.parameters, nextNode.shapeIn, this.setError);
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

  updateParameters(id, name, value, canTuple) {
    /* given a name and a value
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
      // no tuples for things that can't tuple
      if (!canTuple) {
        return;
      }
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

  updateModelInfo(name, value) {
    let modelInfo = this.state.modelInfo
    modelInfo[name] = value;
    this.setState({
      modelInfo: modelInfo,
    });
  }

  setError(err, once) {
    /* sets the error message */
    if (once) {
      this.setState({
        errorMsg: err,
        errorOnce: once,
      });
    } else {
      // do not override one-time messages
      if (this.state.errorOnce && this.state.errorMsg !== null) {
        return;
      } else {
        this.setState({
          errorMsg: err,
          errorOnce: once,
        });
      }
    }
    
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
      modelJSON: JSON.stringify({model: models, batchSize: models[0].parameters.batchSize, epochs: this.state.modelInfo['epochs']}),
    });
    saveModel(serializedModel).then((responseJSON) => {
      let info = this.state.trainingInfo;
      info["training"] = true;
      this.setState({trainingInfo:info, modelID: responseJSON['data']["id"]});
      this.selectModel(-1);
      this.startSession(responseJSON['data']["id"]);
    }).catch(e => {
      this.setError(e.message, true);
    });
  }

  startSession(id) {
    /* start training session */
    startSession(id).then(responseJSON => {
      const data = responseJSON['data'];
      const intervalID = setInterval(this.updateTrain, 100);
      this.setState({
        sessionID: data['sessionID'],
        intervalID: intervalID,
      });
    }).catch(e => {
      this.setError(e.message, true);
    });
  }

  updateTrain() {
    updateTrain(this.state.sessionID).then(data => {
      const trainingInfo = {
        accuracy: String(Math.floor(data['accuracy']*100))+"%",
        testAccuracy: String(Math.floor(data['test_accuracy']*100))+"%",
        loss: Number(parseFloat(data['loss']).toFixed(3)),
        progress: String(Math.floor(data['progress']*100))+"%",
        training: !data['trained'], // whether the model is being trained on cloud
      }
      this.setState({trainingInfo: trainingInfo});
      // stop updating if training is done
      if (data['trained']) {
        clearInterval(this.state.intervalID);
      }
    }).catch(e => {
      this.setError(e.message, true);
      this.cancelTrain();
    });
  }

  cancelTrain() {
    clearInterval(this.state.intervalID);
    let trainingInfo = this.state.trainingInfo;
    trainingInfo['training'] = false;
    this.setState({trainingInfo:trainingInfo});
    deleteTrain(this.state.sessionID);
  }

  loadModel(link) {

  }

  loadDefaultModel(name) {
    switch (name) {
      case "blank":
        this.setState({selectModelPage: false});
        return;
      default:
        return;
    }
  }

  getLink() {
    const models = this.updateDependents(this.state.models);
    this.setState({
      models: models,
    })
    const serializedModel = JSON.stringify({
      modelJSON: JSON.stringify({model: models, batchSize: models[0].parameters.batchSize, epochs: this.state.modelInfo['epochs']}),
    });
    
    saveModel(serializedModel).then(responseJSON => {
      generateLink(responseJSON["data"]["id"]).then( responseJSON => {
        const link = responseJSON['data']['link'];
        this.setState({
          link: link,
          linkPage: true,
        });
      }).catch(err => {
        this.setError(err.message, true);
      });
    }).catch(err => {
      this.setError(err.message, true);
    });
    
  }

  render() {
    return (
      <React.Fragment>
        <LinkPage display={this.state.linkPage} link={this.state.link} toggle={()=>this.setState({linkPage: false})}/>
        <SelectModel display={this.state.selectModelPage} loadModel={this.loadModel} loadDefaultModel={this.loadDefaultModel}></SelectModel>
        <ErrorBox errorMsg={this.state.errorMsg} dismissible={this.state.errorOnce} setError={this.setError}/>
        <div className="container-fluid d-flex h-100 flex-row no-margin">
          <Sidebar models={this.state.models} selected={this.state.selected} trainingInfo={this.state.trainingInfo} newModel={this.newModel} setError={this.setError} update={this.updateModel} trainCloud={this.trainCloud} cancelTrain={this.cancelTrain} getLink={this.getLink}/>
          <div className="d-flex w-100 p-2 flex-column flex-grow-1 no-margin" ref="canvasContainer">
            <CanvasContainer models={this.state.models} selected={this.state.selected} select={this.selectModel} update={this.updateModel} remove={this.removeModel} editableSelected={this.state.editableSelected}/>
            <Toolbar modelInfo={this.state.modelInfo} trainingInfo={this.state.trainingInfo} updateModelInfo={this.updateModelInfo} selected={this.state.selected} models={this.state.models} update={(name, value, canTuple) => this.updateParameters(this.state.selected, name, value, canTuple)} setEditableSelected={this.setEditableSelected}/>
          </div>
          
        </div>
      </React.Fragment>
      
    );
  }
}

export default App;
