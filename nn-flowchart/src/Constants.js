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
    activationSVG = nodeTypes[props.activation.name].svg;
  } else {
    activationSVG = null
  }
  return <React.Fragment>
    <rect width={squareSize} height={squareSize} fill={firstColor}/>,
    <rect x={xInterval} y={yInterval} width={squareSize} height={squareSize} fill={secondColor}/>,
    <rect x={xInterval*2} y={yInterval*2} width={squareSize} height={squareSize} fill={thirdColor}/>,
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
  return <React.Fragment>
    <rect width={xSize} height={ySize} fill={squareColor}/>,
    {circles}
  </React.Fragment>
}


export const nodeTypes = {
    "dense": {
        name: "Dense",
        type: "layer",
        svg: dense,
        offsetX: 20, // offsets are for giving a point of contact for lines
        offsetY: 50, 
    },
    "conv": {
        name: "Conv",
        type: "layer",
        svg: conv,
        offsetX: 40,
        offsetY: 40,
    },
    "relu": {
        name: "ReLU",
        type: "activation",
    }
};

export const layerNames = ["dense", "conv"];
