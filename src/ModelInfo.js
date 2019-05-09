import React from 'react';

function conv(props) {
  const squareSize = 40;
  const xInterval = squareSize / 4;
  const yInterval = squareSize / 4;

  const firstColor = "#2775f4";
  const secondColor = "#4286f4";
  const thirdColor = "#5c98f9";
  let activationSVG;
  if (props.activation != null) {
    activationSVG = nodeTypes[props.activation].svg(xInterval*2+5, yInterval*2+squareSize-2, squareSize-10,squareSize/2 - 4);
  } else {
    activationSVG = null
  }
  return <React.Fragment>
    <rect width={squareSize} height={squareSize} fill={firstColor}/>
    <rect x={xInterval} y={yInterval} width={squareSize} height={squareSize} fill={secondColor}/>
    <rect x={xInterval*2} y={yInterval*2} width={squareSize} height={squareSize} fill={thirdColor}/>
    {activationSVG}
  </React.Fragment>
}

function dense(props) {
  const xSize = 40;
  const ySize = 100;
  const numCircles = 3;
  const squareColor = "#665cf9";
  const circleColor = "#83a5f7";

  const circles = [...Array(numCircles)].map((_, i) =>
    <circle cx={xSize / 2} 
            cy={ySize / (numCircles+1) * (i+1)} 
            key={i}
            r={ySize / (numCircles+1) /2 - 2}
            fill={circleColor}>
            
            </circle>
  );
  let activationSVG;
  if (props.activation != null) {
    activationSVG = nodeTypes[props.activation].svg(4, ySize-2);
  } else {
    activationSVG = null
  }
  return <React.Fragment>
    <rect width={xSize} height={ySize} fill={squareColor}/>,
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
  const width = 20;
  const height = 80;
  return <React.Fragment>
    <rect width={width} height={height} fill={color}></rect>
  </React.Fragment>
}

function maxpool(props) {
  const squareSize = 30;
  const xInterval = squareSize / 4;
  const yInterval = squareSize / 4;

  const firstColor = "#be41f4";
  const secondColor = "#e541f4";
  const thirdColor = "#f95cf9";
  let activationSVG;
  if (props.activation != null) {
    activationSVG = nodeTypes[props.activation].svg(xInterval*2+5, yInterval*2+squareSize-2, squareSize-10,squareSize/2 - 4);
  } else {
    activationSVG = null
  }
  return <React.Fragment>
    <rect width={squareSize} height={squareSize} fill={firstColor}/>
    <rect x={xInterval} y={yInterval} width={squareSize} height={squareSize} fill={secondColor}/>
    <rect x={xInterval*2} y={yInterval*2} width={squareSize} height={squareSize} fill={thirdColor}/>
    {activationSVG}
  </React.Fragment>
}

// redo visual another day yeah? TODO
function relu(x, y) {
  return (
    <text x={x} y={y} fontSize="14">ReLU</text>
  )
}

function sigmoid(x, y) {
  return (
    <text x={x} y={y} fontSize="10">Sigmoid</text>
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
          return [shapeIn[0], parameters["units"]];
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
          const kernel = parameters["kernelSize"];
          
          const stride = (typeof(parameters["stride"]) === "number") ? Array(kernel.length).fill(parameters['stride']) : parameters["stride"];
          const filters = parameters["filters"];
          if (dimensions.length !== kernel.length) {
            setError("Kernel must have the same ndim as the input dimension (without batchSize)", false);
            return null;
          }
          const mapped = dimensions.map((dimension, key) => {
            return Math.floor((dimension - kernel[key])/stride[key]);
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
        batchSize: 25,
      },
      canActivation: false,
      shapeOut: (parameters, shapeIn, setError) => {
        if (parameters["data"] === "MNIST") {
          return [parameters["batchSize"], 28, 28, 1];
        }
        return [parameters["batchSize"], 100, 100, 3];
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
    "output": {
      name: "Output",
      type: "layer",
      svg: output,
      offsetX: 10,
      offsetY: 40,
      defaultParameters: {
        data: "MNIST",
      },
      canActivation: true,
      shapeOut: (parameters, shapeIn, setError) => {
        if (shapeIn === null) {
          return null;
        }
        // keep shape the same
        if (parameters["data"] === "MNIST") {
          return [shapeIn[0], 10]; // will change later
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
    }
};

export const layerNames = ["dense", "conv", "maxpool"];
export const activationNames = ["relu", "sigmoid"];

export const blankModel = JSON.parse('{"0":{"name":"input0","ID":0,"type":"input","x":20,"y":50,"connectedTo":null,"shapeIn":null,"shapeOut":[25,28,28,1],"activation":null,"parameters":{"data":"MNIST","batchSize":25}},"1":{"name":"output1","ID":1,"type":"output","x":299,"y":50,"connectedTo":null,"shapeIn":[25,16],"shapeOut":[25,10],"activation":"sigmoid","parameters":{"data":"MNIST"}}}');

export const convModel = JSON.parse("{\"0\":{\"name\":\"input0\",\"ID\":0,\"type\":\"input\",\"x\":20,\"y\":50,\"connectedTo\":2,\"shapeIn\":null,\"shapeOut\":[25,28,28,1],\"activation\":null,\"parameters\":{\"data\":\"MNIST\",\"batchSize\":25}},\"1\":{\"name\":\"output1\",\"ID\":1,\"type\":\"output\",\"x\":299,\"y\":50,\"connectedTo\":null,\"shapeIn\":[25,16],\"shapeOut\":[25,10],\"activation\":\"sigmoid\",\"parameters\":{\"data\":\"MNIST\"}},\"2\":{\"name\":\"conv2\",\"ID\":2,\"type\":\"conv\",\"x\":74.28643321494462,\"y\":46.87875586829372,\"connectedTo\":3,\"shapeIn\":[25,28,28,1],\"shapeOut\":[25,25,25,8],\"activation\":\"relu\",\"parameters\":{\"filters\":8,\"kernelSize\":[3,3],\"stride\":1}},\"3\":{\"name\":\"maxpool3\",\"ID\":3,\"type\":\"maxpool\",\"x\":153.58841744957806,\"y\":55.21242239191861,\"connectedTo\":4,\"shapeIn\":[25,25,25,8],\"shapeOut\":[25,12,12,8],\"activation\":null,\"parameters\":{\"poolSize\":[2,2]}},\"4\":{\"name\":\"dense4\",\"ID\":4,\"type\":\"dense\",\"x\":219.28041809853335,\"y\":37.307656195514426,\"connectedTo\":1,\"shapeIn\":[25,12,12,8],\"shapeOut\":[25,16],\"activation\":\"relu\",\"parameters\":{\"units\":16}}}");

export const denseModel = JSON.parse("{\"0\":{\"name\":\"input0\",\"ID\":0,\"type\":\"input\",\"x\":20,\"y\":50,\"connectedTo\":3,\"shapeIn\":null,\"shapeOut\":[25,28,28,1],\"activation\":null,\"parameters\":{\"data\":\"MNIST\",\"batchSize\":25}},\"1\":{\"name\":\"output1\",\"ID\":1,\"type\":\"output\",\"x\":299,\"y\":50,\"connectedTo\":null,\"shapeIn\":[25,16],\"shapeOut\":[25,10],\"activation\":\"sigmoid\",\"parameters\":{\"data\":\"MNIST\"}},\"2\":{\"name\":\"dense2\",\"ID\":2,\"type\":\"dense\",\"x\":191.61521311914112,\"y\":41.56822923585631,\"connectedTo\":1,\"shapeIn\":[25,16],\"shapeOut\":[25,16],\"activation\":null,\"parameters\":{\"units\":16}},\"3\":{\"name\":\"dense3\",\"ID\":3,\"type\":\"dense\",\"x\":107.9840483926111,\"y\":39.51253484832063,\"connectedTo\":2,\"shapeIn\":[25,28,28,1],\"shapeOut\":[25,16],\"activation\":null,\"parameters\":{\"units\":16}}}");