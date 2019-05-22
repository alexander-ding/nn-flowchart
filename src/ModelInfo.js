import React from 'react';
import { isArray, isNumber } from 'util';

const activationBoxHeight = 20;
const activationBoxColor = "#cccccc";

function conv(props) {
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
  const size = 30
  const color = "#99ccff";
  return <React.Fragment>
    <rect width={size} height={size} fill={color}/>
  </React.Fragment>
}

function output(props) {
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
  const width = 16;
  const height = 120;
  const color = "#404040";
  return <React.Fragment>
    <rect width={width} height={height} fill={color}></rect>
  </React.Fragment>
}

// redo visual another day yeah? TODO
function relu(x, y) {
  const width = 12;
  const height = 8;
  return <React.Fragment>
    <path d={"M"+(x-width)+" "+y+"l"+width+ " 0 l" + width + " -" + height} stroke="black" strokeWidth="2" fill="none"/>
  </React.Fragment>
}

function sigmoid(x, y) {
  const width = 12;
  const height = 4;
  return (
    <path d={"M "+(x-width)+" "+y+" q "+(width-1)+ " 0 " + width + " " + (-height) + " q 1 " + (-height) + " " + width + " " + (-height)} stroke="black" strokeWidth="2" fill="none"/>
  )
}

function softmax(x, y) {
  const width = 24;
  const height = 8;
  return (
    <path d={"M "+(x-width/2)+" "+y+" q "+(width-1)+ " 0 " + width + " " + (-height)} stroke="black" strokeWidth="2" fill="none"/>
  )
}

function tanh(x, y) {
  // M 0 160 Q 140 160 240 80 Q 340 0 480 0 
  const width = 12;
  const height = 4;
  return (
    <path d={"M "+(x-width)+" "+y+" q "+(width-5)+ " 0 " + width + " " + (-height) + " q 5 " + (-height) + " " + width + " " + (-height)} stroke="black" strokeWidth="2" fill="none"/>
  )
}

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
          return [shapeIn.slice(0,shapeIn.length-1), ...parameters['outputShape']];
        } else {
          return [shapeIn.slice(0,shapeIn.length-1), parameters['outputShape']];
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

export const layerNames = ["dense", "conv", "maxpool", "flatten", "embedding", "dropout"];
export const activationNames = ["relu", "sigmoid", "softmax", "tanh"];

export const blankModel = JSON.parse('{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":null,"shapeIn":null,"shapeOut":[25,28,28,1],"activation":null,"parameters":{"data":"MNIST","batchSize":25, "inputShape":[28,28,1]}},"1":{"name":"output1","ID":1,"type":"output","x":299,"y":50,"connectedTo":null,"shapeIn":[25,16],"shapeOut":[25,10],"activation":"sigmoid","parameters":{"data":"MNIST", "outputShape":[10]}}}');

export const convModel = JSON.parse('{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":2,"shapeIn":null,"shapeOut":[25,28,28,1],"activation":null,"parameters":{"data":"MNIST","batchSize":25, "inputShape":[28,28,1]}},"1":{"name":"output1","ID":1,"type":"output","x":299,"y":50,"connectedTo":null,"shapeIn":[25,16],"shapeOut":[25,10],"activation":"sigmoid","parameters":{"data":"MNIST", "outputShape":[10]}},"2":{"name":"conv2","ID":2,"type":"conv","x":74.28643321494462,"y":46.87875586829372,"connectedTo":3,"shapeIn":[25,28,28,1],"shapeOut":[25,25,25,8],"activation":"relu","parameters":{"filters":8,"kernelSize":[3,3],"stride":1}},"3":{"name":"maxpool3","ID":3,"type":"maxpool","x":153.58841744957806,"y":55.21242239191861,"connectedTo":4,"shapeIn":[25,25,25,8],"shapeOut":[25,12,12,8],"activation":null,"parameters":{"poolSize":[2,2]}},"4":{"name":"dense4","ID":4,"type":"dense","x":219.28041809853335,"y":37.307656195514426,"connectedTo":1,"shapeIn":[25,12,12,8],"shapeOut":[25,16],"activation":"relu","parameters":{"units":16}}}');

export const denseModel = JSON.parse('{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":3,"shapeIn":null,"shapeOut":[25,28,28,1],"activation":null,"parameters":{"data":"MNIST","batchSize":25}},"1":{"name":"output1","ID":1,"type":"output","x":299,"y":50,"connectedTo":null,"shapeIn":[25,16],"shapeOut":[25,10],"activation":"sigmoid","parameters":{"data":"MNIST"}},"2":{"name":"dense2","ID":2,"type":"dense","x":191.61521311914112,"y":41.56822923585631,"connectedTo":1,"shapeIn":[25,16],"shapeOut":[25,16],"activation":"relu","parameters":{"units":16}},"3":{"name":"dense3","ID":3,"type":"dense","x":107.9840483926111,"y":39.51253484832063,"connectedTo":2,"shapeIn":[25,28,28,1],"shapeOut":[25,16],"activation":"relu","parameters":{"units":16}}}');