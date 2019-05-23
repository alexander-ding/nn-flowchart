import React from 'react';
import { isArray, isNumber } from 'util';

// mega fuckton of constants to describe the svg
// shapes of things


// describe layers' and activation function's svg representation
const activationBoxHeight = 20;
const activationBoxColor = "#cccccc";

function conv(props) {
  // svg for a conv layer
  const squareSize = 40;
  const xInterval = squareSize / 4;
  const yInterval = squareSize / 4;

  const firstColor = "#2775f4";
  const secondColor = "#4286f4";
  const thirdColor = "#5c98f9";
  let activationSVG;
  if (props.activation != null) {
    activationSVG = nodeTypes[props.activation].svg(xInterval*2+squareSize/2, yInterval*2+squareSize+activationBoxHeight/2+3);
  } else {
    activationSVG = null
  }
  return <React.Fragment>
    <rect width={squareSize} height={squareSize} fill={firstColor}/>
    <rect x={xInterval} y={yInterval} width={squareSize} height={squareSize} fill={secondColor}/>
    <rect x={xInterval*2} y={yInterval*2} width={squareSize} height={squareSize} fill={thirdColor}/>
    <rect x={xInterval*2} y={yInterval*2+squareSize} width={squareSize} height={activationBoxHeight} fill={activationBoxColor}/>
    {activationSVG}
  </React.Fragment>
}

function dense(props) {
  // svg for a dense layer
  const xSize = 40;
  const ySize = 80;
  const numCircles = 3;
  const squareColor = "#665cf9";
  
  const circleColor = "#83a5f7";

  const circles = [...Array(numCircles)].map((_, i) =>
    <circle cx={xSize / 2} 
            cy={(ySize-8) / numCircles * (i+0.5)+4} 
            key={i}
            r={ySize / numCircles / 2 - 4}
            fill={circleColor}>
            
            </circle>
  );
  let activationSVG;
  if (props.activation != null) {
    activationSVG = nodeTypes[props.activation].svg(xSize/2, ySize+activationBoxHeight/2+3);
  } else {
    activationSVG = null
  }
  return <React.Fragment>
    <rect width={xSize} height={ySize} fill={squareColor}/>
    <rect width={xSize} y={ySize} height={activationBoxHeight} fill={activationBoxColor}/>
    {circles}
    {activationSVG}
  </React.Fragment>
}

function input(props) {
  // svg for an input layer
  const size = 30
  const color = "#99ccff";
  return <React.Fragment>
    <rect width={size} height={size} fill={color}/>
  </React.Fragment>
}

function output(props) {
  // svg for an output layer
  const color = "#008066";
  const width = 30;
  const height = 60;

  let activationSVG;
  if (props.activation != null) {
    activationSVG = nodeTypes[props.activation].svg(width/2, height+activationBoxHeight/2+3);
  } else {
    activationSVG = null
  }

  return <React.Fragment>
    <rect width={width} height={height} fill={color}></rect>
    <rect width={width} y={height} height={activationBoxHeight} fill={activationBoxColor}></rect>
    {activationSVG}
  </React.Fragment>
}

function maxpool(props) {
  // svg for a maxpool layer
  const squareSize = 30;
  const xInterval = squareSize / 4;
  const yInterval = squareSize / 4;

  const firstColor = "#be41f4";
  const secondColor = "#e541f4";
  const thirdColor = "#f95cf9";

  return <React.Fragment>
    <rect width={squareSize} height={squareSize} fill={firstColor}/>
    <rect x={xInterval} y={yInterval} width={squareSize} height={squareSize} fill={secondColor}/>
    <rect x={xInterval*2} y={yInterval*2} width={squareSize} height={squareSize} fill={thirdColor}/>
  </React.Fragment>
}

function embedding(props) {
  // svg for an embedding layer
  const width = 20;
  const height = 15;
  const firstColor = "#6a41f4";
  const secondColor = "#8a61ff";
  const thirdColor = "#7a51f5";
  return <React.Fragment>
    <rect width={width*3} height={height} fill={firstColor}></rect>
    <rect width={width*1.5} height={height} y={height} fill={secondColor}></rect>
    <rect width={width*2.5} height={height} y={height*2} fill={thirdColor}></rect>
  </React.Fragment>
}

function dropout(props) {
  // svg for a dropout layer
  const len = 10;
  const color = "#404040";
  return <React.Fragment>
    <rect width={len} height={len} x={len*0} y={len*0} fill={color}></rect>
    <rect width={len} height={len} x={len*2} y={len*0} fill={color}></rect>
    <rect width={len} height={len} x={len*3} y={len*0} fill={color}></rect>
    <rect width={len} height={len} x={len*1} y={len*1} fill={color}></rect>
    <rect width={len} height={len} x={len*2} y={len*1} fill={color}></rect>
    <rect width={len} height={len} x={len*0} y={len*2} fill={color}></rect>
    <rect width={len} height={len} x={len*2} y={len*2} fill={color}></rect>
    <rect width={len} height={len} x={len*3} y={len*2} fill={color}></rect>
    <rect width={len} height={len} x={len*1} y={len*3} fill={color}></rect>
    <rect width={len} height={len} x={len*2} y={len*3} fill={color}></rect>
    <rect width={len} height={len} x={len*3} y={len*3} fill={color}></rect>
  </React.Fragment>
}

function flatten(props) {
  // svg for a flatten layer
  const width = 16;
  const height = 120;
  const color = "#404040";
  return <React.Fragment>
    <rect width={width} height={height} fill={color}></rect>
  </React.Fragment>
}

function relu(x, y) {
  // svg for a relu function
  const width = 12;
  const height = 8;
  return <React.Fragment>
    <path d={"M"+(x-width)+" "+y+"l"+width+ " 0 l" + width + " -" + height} stroke="black" strokeWidth="2" fill="none"/>
  </React.Fragment>
}

function sigmoid(x, y) {
  // svg for a sigmoid function
  const width = 12;
  const height = 4;
  return (
    <path d={"M "+(x-width)+" "+y+" q "+(width-1)+ " 0 " + width + " " + (-height) + " q 1 " + (-height) + " " + width + " " + (-height)} stroke="black" strokeWidth="2" fill="none"/>
  )
}

function softmax(x, y) {
  // svg for a softmax function
  const width = 24;
  const height = 8;
  return (
    <path d={"M "+(x-width/2)+" "+y+" q "+(width-1)+ " 0 " + width + " " + (-height)} stroke="black" strokeWidth="2" fill="none"/>
  )
}

function tanh(x, y) {
  // svg for a tanh function
  const width = 12;
  const height = 4;
  return (
    <path d={"M "+(x-width)+" "+y+" q "+(width-5)+ " 0 " + width + " " + (-height) + " q 5 " + (-height) + " " + width + " " + (-height)} stroke="black" strokeWidth="2" fill="none"/>
  )
}

// this is a mapping from node type (layer or activation)
// to its relevant constant information

// name is its display name
// type can be layer or activation
// svg is its corresponding svg to be rendered
// defaultParameters include its default parameters
// canActivation indicates whether a layer can have an activation function
// shapeOut is a functio nto calculate its output shape given its parameter and input shape

// offsetX and offsetY for finding the center of the svg (from its corner)

export const nodeTypes = {
    "dense": {
        name: "Dense",
        type: "layer",
        svg: dense,
        offsetX: 20, // offsets are for giving a point of contact for lines
        offsetY: 50, 
        defaultParameters: {
          units: 16,
        },
        canActivation: true,
        // the function to compute the output shape given input shape and parameters
        shapeOut: (parameters, shapeIn, setError) => {
          if (shapeIn === null) {
            return null;
          }
          return [...shapeIn.slice(0,shapeIn.length-1), parameters["units"]];
        },
    },
    "conv": {
        name: "Conv",
        type: "layer",
        svg: conv,
        offsetX: 40,
        offsetY: 40,
        defaultParameters: {
          filters: 8,
          kernelSize: [3,3], // could be both tuple or int. ndim needs to match with stride
          stride: 1, // could be both tuple or int
        },
        canActivation: true,
        shapeOut: (parameters, shapeIn, setError) => {
          if (shapeIn === null) {
            return null;
          }
          const batchSize = shapeIn[0];
          const dimensions = shapeIn.slice(1, shapeIn.length-1);
          const kernel = isArray(parameters["kernelSize"]) ? parameters["kernelSize"] : [parameters["kernelSize"]];
          
          const stride = (typeof(parameters["stride"]) === "number") ? Array(kernel.length).fill(parameters['stride']) : parameters["stride"];
          const filters = parameters["filters"];
          if (dimensions.length !== kernel.length) {
            setError("Kernel must have the same ndim as the input dimension (without batchSize)", false);
            return null;
          }
          const mapped = dimensions.map((dimension, key) => {
            return Math.floor((dimension - kernel[key])/stride[key])+1;
          });
          return [batchSize, ...mapped, filters];
        },
    },
    "input": {
      name: "Input",
      type: "layer",
      svg: input,
      offsetX: 15,
      offsetY: 15,
      defaultParameters: {
        data: "MNIST",
        datasetID: "",
        inputShape: [28, 28, 1],
      },
      canActivation: false,
      shapeOut: (parameters, modelInfo, setError) => {
        if (parameters['inputShape'] === null) {
          return null;
        }
        if (isArray(parameters['inputShape'])) {
          return [Number(modelInfo["batchSize"]), ...parameters['inputShape']];
        }
        return [Number(modelInfo["batchSize"]), parameters['inputShape']];
      },
    },
    "maxpool": {
      name: "Max Pool",
      type: "layer",
      svg: maxpool,
      offsetX: 30,
      offsetY: 30,
      defaultParameters: {
        poolSize: [2,2], // the length is dimensionality; can be between 1 to 3
      },
      canActivation: false,
      shapeOut: (parameters, shapeIn, setError) => {
        if (shapeIn === null) {
          return null;
        }
        const batchSize = shapeIn[0];
        const dimensions = shapeIn.slice(1,shapeIn.length-1);
        const filters = shapeIn[shapeIn.length-1];
        const poolSize = (typeof(parameters["poolSize"]) === "number") ? [parameters["poolSize"]] : parameters["poolSize"];
        
        if (dimensions.length !== poolSize.length) {
          setError("PoolSize must have the same ndim as the input dimension (without batchSize)", false);
          return null;
        }
        const mapped = dimensions.map((dimension, key) => {
          return Math.floor((dimension)/poolSize[key]);
        });
        return [batchSize, ...mapped, filters];
      }
    },
    "embedding": {
      name: "Embedding",
      type: "layer",
      svg: embedding,
      offsetX: 25,
      offsetY: 20,
      defaultParameters: {
        units: 100,
      },
      canActivation: false,
      shapeOut: (parameters, shapeIn, setError) => {
        if (shapeIn === null) {
          return null;
        }
        if (isNumber(shapeIn) || shapeIn.length !== 2) {
          setError("Embedding input shape must be (batchSize, sequenceLength)", false);
          return null;
        }
        return [shapeIn[0], shapeIn[1], parameters['units']];
      },
    },
    "dropout": {
      name: "Dropout",
      type: "layer",
      svg: dropout,
      offsetX: 20,
      offsetY: 20,
      defaultParameters: {
        rate: 0.25,
      },
      canActivation: false,
      shapeOut: (parameters, shapeIn, setError) => {
        if (shapeIn === null) {
          return null;
        }
        return shapeIn;
      }
    },
    "flatten": {
      name: "Flatten",
      type: "layer",
      svg: flatten,
      offsetX: 8,
      offsetY: 60,
      defaultParameters: {},
      canActivation: false,
      shapeOut: (parameters, shapeIn, setError) => {
        if (shapeIn === null) {
          return null;
        }
        if (isNumber(shapeIn) || shapeIn.length <= 2) {
          setError("Flatten input shape must be (batchSize, ...shape) (ndim > 2)", false);
          return null;
        }
        return [shapeIn[0], shapeIn.slice(1).reduce((total, value) => total*value)];
      }
    },
    "output": {
      name: "Output",
      type: "layer",
      svg: output,
      offsetX: 10,
      offsetY: 40,
      defaultParameters: {
        data: "MNIST",
        outputShape: [10],
      },
      canActivation: true,
      shapeOut: (parameters, shapeIn, setError) => {
        if (shapeIn === null) {
          return null;
        }
        if (isNumber(shapeIn) || shapeIn.length !== 2) {
          setError("Output layer must have input layer of shape (batchSize, dim)", false);
        }
        if (isArray(parameters['outputShape'])) {
          return [...shapeIn.slice(0,shapeIn.length-1), ...parameters['outputShape']];
        } else {
          return [...shapeIn.slice(0,shapeIn.length-1), parameters['outputShape']];
        }
        
      },
    },
    "relu": {
      name: "ReLU",
      type: "activation",
      svg: relu,
      defaultParameters: {}
    },
    "sigmoid": {
      name: "Sigmoid",
      type: "activation",
      svg: sigmoid,
      defaultParameters: {}
    },
    "tanh": {
      name: "Tanh",
      type: "activation",
      svg: tanh,
      defaultParameters: {}
    },
    "softmax": {
      name: "SoftMax",
      type: "activation",
      svg: softmax,
      defaultParameters: {}
    }
};

// some more constants
export const layerNames = ["dense", "conv", "maxpool", "flatten", "embedding", "dropout"];
export const activationNames = ["relu", "sigmoid", "softmax", "tanh"];

// preset models

export const blankModel = JSON.parse('{"model":{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":null,"shapeIn":[25,28,28,1],"shapeOut":[25,28,28,1],"activation":null,"parameters":{"data":"MNIST","datasetID":"","inputShape":[28,28,1]}},"1":{"name":"output1","ID":1,"type":"output","x":300,"y":50,"connectedTo":null,"shapeIn":null,"shapeOut":null,"activation":null,"parameters":{"data":"MNIST","outputShape":[10]}}},"modelInfo":{"epochs":"2","batchSize":"25","maxToken":null,"loss":"cce","optimizer":"adam","learningRate":"0.01"}}');

export const convModel = JSON.parse('{"model":{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":4,"shapeIn":[25,28,28,1],"shapeOut":[25,28,28,1],"activation":null,"parameters":{"data":"MNIST","datasetID":"","inputShape":[28,28,1]}},"1":{"name":"output1","ID":1,"type":"output","x":300,"y":50,"connectedTo":null,"shapeIn":[25,288],"shapeOut":[25,10],"activation":null,"parameters":{"data":"MNIST","outputShape":[10]}},"4":{"name":"conv4","ID":4,"type":"conv","x":93.22129625745828,"y":45.02453806961887,"connectedTo":5,"shapeIn":[25,28,28,1],"shapeOut":[25,13,13,8],"activation":null,"parameters":{"filters":8,"kernelSize":[3,3],"stride":2}},"5":{"name":"maxpool5","ID":5,"type":"maxpool","x":164.94433122077317,"y":50.04710123987789,"connectedTo":6,"shapeIn":[25,13,13,8],"shapeOut":[25,6,6,8],"activation":null,"parameters":{"poolSize":[2,2]}},"6":{"name":"flatten6","ID":6,"type":"flatten","x":227.27825598586503,"y":17.505554649411522,"connectedTo":1,"shapeIn":[25,6,6,8],"shapeOut":[25,288],"activation":null,"parameters":{}}},"modelInfo":{"epochs":"2","batchSize":"25","maxToken":null,"loss":"cce","optimizer":"adam","learningRate":"0.01"}}');

export const denseModel = JSON.parse('{"model":{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":2,"shapeIn":[25,500],"shapeOut":[25,500],"activation":null,"parameters":{"data":"IMDB","datasetID":"","inputShape":[500]}},"1":{"name":"output1","ID":1,"type":"output","x":300,"y":50,"connectedTo":null,"shapeIn":[25,128],"shapeOut":[25,2],"activation":null,"parameters":{"data":"MNIST","outputShape":[2]}},"2":{"name":"embedding2","ID":2,"type":"embedding","x":75.94492317196415,"y":64.44874382584419,"connectedTo":3,"shapeIn":[25,500],"shapeOut":[25,500,100],"activation":null,"parameters":{"units":100}},"3":{"name":"flatten3","ID":3,"type":"flatten","x":153.95333629131653,"y":24.011553705551506,"connectedTo":4,"shapeIn":[25,500,100],"shapeOut":[25,50000],"activation":null,"parameters":{}},"4":{"name":"dense4","ID":4,"type":"dense","x":207.20185248114421,"y":39.051709968596924,"connectedTo":1,"shapeIn":[25,50000],"shapeOut":[25,128],"activation":null,"parameters":{"units":128}}},"modelInfo":{"epochs":"2","batchSize":"25","maxToken":1000,"loss":"cce","optimizer":"adam","learningRate":"0.01"}}');