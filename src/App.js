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
import {getModel, saveModel, generateLink, getIDFromLink, loadInput} from "./Server.js";
import {TrainSetup} from "./TrainSetup.js";
import {DATASET_SHAPE} from "./Constants.js";
import {compileModel} from "./Model.js";
import {MnistData} from "./Data.js";
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
        status: "Edit", // whether the model is getting trained or editted
        currentEpoch: 0,
        correct: 0,
        total: 0,
        batchesPerEpoch: null,
      },
      
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
    this.endSession = this.endSession.bind(this); 
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

    const model = compileModel(this.state.models, this.state.modelInfo);

    this.startSession(model);
  }

  

  startSession(model) {
    /* start training session */
    // periodically retrieve latest training info
    let trainingInfo = this.state.trainingInfo;
    trainingInfo.status = 'Loading...';

    this.setState({trainingInfo: trainingInfo});
    const data = new MnistData();
    const updateTrain = this.updateTrain;
    const endSession = this.endSession;
    data.load().then(() => {
      const [xs, ys] = data.getTrainData(10000);
      
      trainingInfo.status = 'Training';
      trainingInfo.batchesPerEpoch = Math.floor(xs.shape[0] / this.state.modelInfo.batchSize);
      trainingInfo.currentEpoch = -1; // as the first call will add 1
      this.setState({trainingInfo: trainingInfo});
      model.fit(xs, ys, {
        epochs: parseInt(this.state.modelInfo.epochs),
        batchSize: parseInt(this.state.modelInfo.batchSize),
        callbacks: {onBatchEnd: (batch, logs) => updateTrain(model, batch, logs), onTrainEnd: (logs) => endSession(model, data)},
        validationSplit: 0.1,
      });
      
    })
    this.selectModel(-1); // deselect any model to show training progress
  }

  

  updateTrain(model, batch, logs) {
    /* update the information about the current training session */

    // if early stopping
    if (this.state.trainingInfo.status === "Edit") {
      model.stopTraining = true;
      return;
    }
    let trainingInfo = this.state.trainingInfo;
    if (batch === 0) {
      trainingInfo.currentEpoch += 1;
      trainingInfo.correct = 0;
      trainingInfo.total = 0;
    }
    const batchSize = parseInt(this.state.modelInfo.batchSize);
    const epochs = this.state.modelInfo.epochs;
    const batchesPerEpoch = this.state.trainingInfo.batchesPerEpoch;
    const currentEpoch = trainingInfo.currentEpoch;

    const correct = logs.acc * batchSize;
    trainingInfo.correct += correct;
    trainingInfo.total += batchSize;
    trainingInfo.accuracy = trainingInfo.correct / trainingInfo.total;
    trainingInfo.loss = logs.loss;
    trainingInfo.progress = (currentEpoch / epochs) + (batch / batchesPerEpoch) / epochs;
    this.setState({trainingInfo: trainingInfo});
    
  }

  endSession(model, data) {
    let trainingInfo = this.state.trainingInfo;
    trainingInfo.progress = 1;
    trainingInfo.currentEpoch = 0;
    trainingInfo.status = "Test";
    this.setState({trainingInfo: trainingInfo});

    // then evaluate the model
    const [xs, ys] = data.getTestData();
    const result = model.evaluate(xs, ys);
    const testAccuracy = result[1].as1D().dataSync()[0];
    trainingInfo.testAccuracy = testAccuracy;
    trainingInfo.status = "Edit";
    trainingInfo.progress = 0;
    this.setState({trainingInfo: trainingInfo});
  }

  cancelTrain() {
    /* cancel the training session */
    let trainingInfo = this.state.trainingInfo;
    trainingInfo['status'] = "Edit";
    this.setState({trainingInfo:trainingInfo});
  }

  loadModel(link, setError) {
    /* load a stored model from a model's link */

    // get model ID
    getIDFromLink(link).then(modelID => {
      // then get the model itself given the ID
      getModel(modelID).then(modelJSON => {
        const decoded = JSON.parse(modelJSON);
        let modelInfo = this.state.modelInfo;
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
      nextID: Math.max(...Object.keys(model['model']).map(key => Number(key)))+1,
      models: model['model'],
      modelInfo: model['modelInfo'],
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

  async downloadModel() {
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

    // compile the model
    const model = compileModel(models, this.state.modelInfo);
    await model.save("downloads://tfjs-model");
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
