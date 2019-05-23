import React from 'react';
import {Sidebar} from "./Sidebar.js";
import {CanvasContainer} from "./Canvas.js";
import {Toolbar} from "./Toolbar.js";
import {ErrorBox} from "./ErrorBox.js";
import {SelectModel} from "./SelectModel.js";
import {LinkPage} from "./LinkPage.js";
import {SetInput} from "./SetInput.js";
import {isCyclic, isLinear, isTrainable} from "./Utils.js";
import {nodeTypes, blankModel, denseModel, convModel} from "./ModelInfo.js";
import {getModel, saveModel, startSession, updateTrain, deleteTrain, generateLink, getIDFromLink, downloadModel, loadInput} from "./Server.js";
import {TrainSetup} from "./TrainSetup.js";
import {DATASET_SHAPE} from "./Constants.js";
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
        batchSize: "25",
        maxToken: null,
        loss: "cce", // loss function
        optimizer: "adam",
        learningRate: "0.01",
      },
      selected: 0, // selected node;
      nextID: 2, // the ID for the next new layer; incremented as model grows
      errorMsg: null, // error message
      errorOnce: false, // whether the current error message can be cancelled 
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
      settingInput: false, // are we on a page to set input?
      trainSetup: false, // are we customizing training information?
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
    this.downloadModel = this.downloadModel.bind(this);

    this.getLink = this.getLink.bind(this);
    this.setInput = this.setInput.bind(this);
    this.loadDefaultInput = this.loadDefaultInput.bind(this);
    this.loadCustomInput = this.loadCustomInput.bind(this);

    this.trainSetup = this.trainSetup.bind(this);
  }

  _model(type, id, x, y) {
    /* Helper function to make a new model (for a layer) given id and its position
     */
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
    /* Function to make a new model given its layer type, putting
     * it in a random location on the upper left corner of the canvas
     */
    return this._model(type, this.state.nextID, 10 + Math.random() * 80, 10 + Math.random() * 80);
  }
  updateDependents(models) {
    /* Given the current models, return models with the dependents
     * (parameters updated given the independent variables) updated
     * also reset the error (and may set some new ones given what happens in
     * updating dependents)
     */
    this.setError(null, false);
    return this._updateDependents(models);
  }
  _updateDependents(models) {
    /* helper function to update members of nodes
     * that depend on other parts of the system 
     */
    // get the input model
    let inputNode = models[0];
    inputNode.shapeOut = nodeTypes[inputNode.type].shapeOut(inputNode.parameters, this.state.modelInfo, this.setError);
    inputNode.shapeIn = inputNode.shapeOut;
    let currentNode = inputNode;
    let nextNode = models[inputNode.connectedTo];
    while (currentNode.connectedTo !== null) {
      nextNode.shapeIn = currentNode.shapeOut;
      if (nextNode.type === "input") {
        nextNode.shapeOut = nodeTypes[nextNode.type].shapeOut(nextNode.parameters, this.state.modelInfo, this.setError);
      } else {
        nextNode.shapeOut = nodeTypes[nextNode.type].shapeOut(nextNode.parameters, nextNode.shapeIn, this.setError);
      }
      
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
      this.setError("Graph cannot have loops", false);
      return;
    } else if (!isLinear(models)["ok"]) {
      this.setError(isLinear(models)["err"], false);
      return;
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

  updateParameters(id, name, value, canTuple, floatOkay=false) {
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
      const num = floatOkay ? parseFloat(components[i]) : parseInt(components[i]);
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

  updateModelInfo(name, value, intOnly=false) {
    /* update a key value pair of a model
     * if intOnly is true, then the value must be an
     * integer, or else it is rejected
     */
    
    // reject non-ints
    if (intOnly) {
      if (isNaN(value) || value === "") {
        return;
      }
    }
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
    /* set whether an editable model is selected */
    this.setState({
      editableSelected: t,
    });
  }

  trainCloud() {
    /* train the model on cloud, if the model is 
     * well-formed
     */

    // first check if the model is linear
    const models = this.updateDependents(this.state.models);
    this.setState({
      models: models,
    })

    // then we check if the model is well-formed
    const resp = isTrainable(models);
    if (!resp["ok"]) {
      this.setError(resp["err"], true);
      return;
    }

    // serialize model and save it to the database first
    const serializedModel = JSON.stringify({
      modelJSON: JSON.stringify({model: models, modelInfo: this.state.modelInfo}),
    });
    
    saveModel(serializedModel).then((responseJSON) => {
      let info = this.state.trainingInfo;
      info["training"] = true;
      this.setState({trainingInfo:info, modelID: responseJSON['data']["id"]});
      this.selectModel(-1); // deselect any model to show training progress
      // after it is saved, start a training session
      this.startSession(responseJSON['data']["id"]);
    }).catch(e => {
      this.setError(e.message, true);
    });
  }

  startSession(id) {
    /* start training session */
    startSession(id).then(responseJSON => {
      const data = responseJSON['data'];
      // periodically retrieve latest training info
      const intervalID = setInterval(this.updateTrain, 100);

      // set the retrieved session id
      this.setState({
        sessionID: data['sessionID'],
        intervalID: intervalID,
      });
    }).catch(e => {
      this.setError(e.message, true);
    });
  }

  updateTrain() {
    /* update the information about the current training session */
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
    /* cancel the training session */
    clearInterval(this.state.intervalID);
    let trainingInfo = this.state.trainingInfo;
    trainingInfo['training'] = false;
    this.setState({trainingInfo:trainingInfo});
    deleteTrain(this.state.sessionID);
  }

  loadModel(link, setError) {
    /* load a stored model from a model's link */

    // get model ID
    getIDFromLink(link).then(modelID => {
      // then get the model itself given the ID
      getModel(modelID).then(modelJSON => {
        const decoded = JSON.parse(modelJSON);
        let modelInfo = this.state.modelInfo;
        modelInfo['epochs'] = decoded['epochs'];
        this.setState({
          modelInfo: modelInfo,
          models: decoded['model'],
          // find the largest index
          nextID: Math.max(...Object.keys(decoded['model']).map(key => Number(key)))+1,
          selectModelPage: false,
        });
        setError(null);
      }).catch(err => {
        setError(err.message);
      })
    }).catch(err => {
      setError(err.message);
    });
  }

  loadDefaultModel(name) {
    /* load one of the preset default models */
    let model = null;
    switch (name) {
      case "blank":
        model = blankModel;
        break;
      case "dense":
        model = denseModel;
        break;
      case "conv":
        model = convModel;
        break;
      default:
        return;
    }
    this.setState({
      nextID: Math.max(...Object.keys(model).map(key => Number(key)))+1,
      models: model['model'],
      modelInfo: model['info'],
      selectModelPage: false,
    });

  }

  getLink() {
    /* get a link for the current model */
    const models = this.updateDependents(this.state.models);
    this.setState({
      models: models,
    })
    const serializedModel = JSON.stringify({
      modelJSON: JSON.stringify({model: models, modelInfo: this.state.modelInfo}),
    });
    
    // save the model first then get a link
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

  downloadModel() {
    /* download the current model */

    // first update dependent to make sure things are right
    const models = this.updateDependents(this.state.models);
    this.setState({
      models: models,
    })

    // check if model is well-formed
    const resp = isTrainable(models);
    if (!resp["ok"]) {
      this.setError(resp["err"], true);
      return;
    }

    // save the model, then download it
    const serializedModel = JSON.stringify({
      modelJSON: JSON.stringify({model: models, modelInfo: this.state.modelInfo}),
    });
    saveModel(serializedModel).then((responseJSON) => {
      const modelID = responseJSON['data']["id"];
      downloadModel(modelID).then(data => {
        // create a temporary anchor element and click it
        // to download this file
        const element = document.createElement("a");
        const file = new Blob([data], {type: 'text/json'});
        element.href = URL.createObjectURL(file);
        element.download = "model_architecture.json";
        element.click();
      }).catch(e => {
        this.setError(e.message, true);
      })
    }).catch(e => {
      this.setError(e.message, true);
    });
  }

  loadDefaultInput(name) {
    /* load an input dataset that is preset */
    
    let models = this.state.models;
    // set the parameters of the current model
    models[0]['parameters']['data'] = name;
    models[0]['parameters']['inputShape'] = DATASET_SHAPE[name].input;
    models[1]['parameters']['outputShape'] = DATASET_SHAPE[name].output;

    let modelInfo = this.state.modelInfo;
    if (name === "IMDB")
      modelInfo['maxToken'] = 1000;
    this.setState({
      // update dependent to make shapes correct
      models: this.updateDependents(models), 
      settingInput: false,
      modelInfo: modelInfo,
    });
  }

  loadCustomInput(url, name, inputShape, outputShape, setError) {
    /* load a user custom input set */

    // make sure all the inputs are reasonable
    if (inputShape.length === 0 || outputShape.length === 0) {
      setError("Input and output shapes must be set");
      return;
    }
    if (name === null) {
      setError("Name your dataset!");
      return;
    }

    // load the input from server
    loadInput(url, name, inputShape, outputShape).catch(e => {
      setError(e.message);
      return;
    }).then(data => {
      let models = this.state.models;
      // store them into the current model
      models[0].parameters['data'] = data.datasetName;
      models[0].parameters['inputShape'] = JSON.parse(data.inputShape);
      models[0].parameters['datasetID'] = data.datasetID;
      models[1].parameters['data'] = data.datasetName;
      models[1].parameters['outputShape'] = JSON.parse(data.outputShape);
      // keep shapes correct
      models = this.updateDependents(models);

      this.setState({
        models: models,
        settingInput: false,
      });
      console.log(models);
    });
  }

  setInput() {
    /* bring up the setting input page */
    this.setState({
      settingInput: true,
    });
  }

  trainSetup() {
    /* bring up the train setup page */
    this.setState({
      trainSetup: true,
    })
  }

  render() {
    return (
      <React.Fragment>
        <LinkPage display={this.state.linkPage} link={this.state.link} toggle={()=>this.setState({linkPage: false})}/>
        <SelectModel display={this.state.selectModelPage} loadModel={this.loadModel} loadDefaultModel={this.loadDefaultModel} toggle={()=>this.setState({selectModelPage: false})}></SelectModel>
        <SetInput display={this.state.settingInput} loadDefaultInput={this.loadDefaultInput} loadInput={this.loadCustomInput} toggle={()=>{this.setState({settingInput: false})}}></SetInput>
        <TrainSetup display={this.state.trainSetup} toggle={()=>this.setState({trainSetup: false})} modelInfo={this.state.modelInfo} update={this.updateModelInfo}></TrainSetup>
        <ErrorBox errorMsg={this.state.errorMsg} dismissible={this.state.errorOnce} setError={this.setError}/>
        <div className="container-fluid d-flex h-100 flex-row no-margin">
          <Sidebar models={this.state.models} selected={this.state.selected} trainingInfo={this.state.trainingInfo} newModel={this.newModel} setError={this.setError} update={this.updateModel} setSelectModelPage={() => this.setState({selectModelPage:true})} trainCloud={this.trainCloud} cancelTrain={this.cancelTrain} getLink={this.getLink} downloadModel={this.downloadModel} setInput={this.setInput}/>
          <div className="d-flex w-100 p-2 flex-column flex-grow-1 no-margin" ref="canvasContainer">
            <CanvasContainer models={this.state.models} selected={this.state.selected} select={this.selectModel} update={this.updateModel} remove={this.removeModel} editableSelected={this.state.editableSelected}/>
            <Toolbar trainSetup={this.trainSetup} modelInfo={this.state.modelInfo} setInputDataset={this.setInput} trainingInfo={this.state.trainingInfo} updateModelInfo={this.updateModelInfo} selected={this.state.selected} models={this.state.models} update={(name, value, canTuple, floatOkay=false) => this.updateParameters(this.state.selected, name, value, canTuple, floatOkay)} setEditableSelected={this.setEditableSelected}/>
          </div>
          
        </div>
      </React.Fragment>
      
    );
  }
}

export default App;
