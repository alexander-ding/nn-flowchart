import React from 'react';
import "./ErrorBox.css";

export function ErrorBox(props) {
  /* Renders a dismissable error message */
  // display nothing if no error message
  if (props.errorMsg === null) {
    return null;
  }
  if (props.dismissible) {
    return (
      <div className="position-absolute float-box">
        <div className="alert alert-danger alert-dismissible position-absolute w-100">
          <strong>Error:</strong> {props.errorMsg}
          <button type="button" className="close" data-dismiss="alert" aria-label="Close" 
                  onClick={() => props.setError(null, true)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="position-absolute float-box">
      <div className="alert alert-danger position-absolute w-100">
        <strong>Error:</strong> {props.errorMsg}
      </div>
    </div>
  )
}
