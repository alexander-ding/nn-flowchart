import React from 'react';
import "./LinkPage.css";

export function LinkPage(props) {
  if (!props.display) {
    return null;
  }
  // some code to copy to clipboard
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = props.link;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  return (
    <div onClick={e=>{
      if (e.target.id === "linkpage-container" || e.target.id === "linkpage-content") {
        props.toggle();
      }
    }} className="linkpage-container" id="linkpage-container">
      <div className="linkpage-content" id="linkpage-content">
      <h1>Model Link</h1>
      <input readOnly className="form-control" type="text" value={props.link}/>
      <small className="form-text text-muted">{"Link copied to clipboard"}</small>
      </div>
    </div>
  );
  
}