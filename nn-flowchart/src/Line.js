import React from 'react';

export function MarkerDefs(props) {
    return (
      <defs>
        <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5"
          markerWidth="5" markerHeight="5">
          <circle cx="5" cy="5" r="3" fill="black" />
        </marker>
        <marker id="arrow" markerWidth="4" markerHeight="4"
        orient="auto" refY="2">
          <path d="M0,0 L4,2 0,4"/>
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
    const midX = (props.x1+props.x2) / 2;
    const midY = (props.y1+props.y2) / 2;
    return (
    <path d={"M "+props.x1+" "+props.y1+
             " L "+midX+" "+midY+
             " L "+props.x2+" "+props.y2}
          onClick={onClick}
          className={className}
          pointerEvents={pointerEvents}
          strokeDasharray={strokeDasharray} 
          stroke="black" 
          strokeWidth="3"
          markerStart="url(#arrow)"
          markerMid="url(#arrow)"
          markerEnd="url(#dot)"/>
    );
  }
  