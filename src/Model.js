import * as tf from '@tensorflow/tfjs';

export function compileModel(models,modelInfo) {
  const model = getModel(models, modelInfo);
  const optimizer = getOptimizer(modelInfo);
  const loss = getLoss(modelInfo.loss);
  model.compile({
    optimizer: optimizer,
    loss: loss,
    metrics: ['acc']
  });
  return model;
}

function getLoss(loss) {
  let loss_fn = null;
  switch (loss) {
    case "mse":
      loss_fn = tf.losses.meanSquaredError;
      break;
    case "logcosh":
      loss_fn = "logcosh";
      break;
    case "cce":
      loss_fn = "categoricalCrossentropy";
      break;
    default:
      break;
  }
  return loss_fn;
}

function getOptimizer(modelInfo) {
  let optimizer = null;
  switch (modelInfo.optimizer) {
    case "adam":
      optimizer = tf.train.adam
      break;
    case "sgd":
      optimizer = tf.train.sgd;
      break;
    case "rmsprop":
      optimizer = tf.train.rmsprop;
      break;
    default:
      break;
  }
  return optimizer(modelInfo.learningRate);
}

function getModel(models, modelInfo) {
  let layers = {};
  Object.keys(models).map((key, index) => {
    const model = models[key];
    layers[key] = compileLayer(model,modelInfo);
    return null;
  });
  const model = tf.sequential();
  let current_id = 0;
  do {
    model.add(layers[current_id]);
    current_id = models[current_id].connectedTo;
  } while (models[current_id].type !== "output")
  model.add(layers[current_id]);
  return model;
}

function compileLayer(model, modelInfo) {
  const f = getLayerF(model);
  let para = JSON.parse(JSON.stringify(model.parameters)); // make a copy
  para.activation = model.activation;
  if (model.type === "input") {
    para.inputShape = model.shapeIn.slice(1);
  } else if (model.type === "output") {
    para.units = model.shapeOut.slice(1)[0];
  } else if (model.type === "embedding") {
    para.inputDim = modelInfo.maxToken;
    para.outputDim = para.units;
  }
  return f(para);
}

function getLayerF(model) {
  let f = null;
  const shape = model.shapeIn.slice(1, model.shapeIn.length-1);

  switch (model.type) {
    case "input":
      f = tf.layers.inputLayer;
      break;
    case "output":
      f = tf.layers.dense;
      break;
    case "dense":
      f = tf.layers.dense;
      break;
    case "conv":
      if (shape.length === 1) {
        f = tf.layers.conv1d;
      } else if (shape.length === 2) {
        f = tf.layers.conv2d;
      }
      break;
    case "maxpool":
      if (shape.length === 1) {
        f = tf.layers.maxPooling1d;
      } else if (shape.length === 2) {
        f = tf.layers.maxPooling2d;
      }
      break;
    case "flatten":
      f = tf.layers.flatten;
      break;
    case "embedding":
      f = tf.layers.embedding;
      break;
    case "dropout":
      f = tf.layers.dropout;
      break;
    default:
      break; 
  }
  return f;
}