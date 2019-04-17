import React from 'react';

export function MarkerDefs(props) {
    return (
      <defs>
        <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5"
          markerWidth="5" markerHeight="5">
          <circle cx="5" cy="5" r="3" fill="black" />
        </marker>
      </defs>
    )
  }
  
export function Line(props) {
    const strokeDasharray = props.tentative ? "5,5" : null;
    const className = props.selected ? "selected" : null;
    const onClick = props.tentative ? null : props.onClick;
    let pointerEvents = props.tentative ? "none" : null;
    if ("pointerEvents" in props) {
      pointerEvents = props.pointerEvents;
    }
    return (
    <line x1={props.x1} 
          y1={props.y1} 
          x2={props.x2} 
          y2={props.y2}
          onClick={onClick}
          className={className}
          pointerEvents={pointerEvents}
          strokeDasharray={strokeDasharray} 
          stroke="black" 
          strokeWidth="3"
          markerStart="url(#dot)"
          markerEnd="url(#dot)"
    />
    );
  }
  