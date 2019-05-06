import ReactDOM from 'react-dom';
import React from 'react';
import "./SelectModel.css";

export class SelectModel extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      err: null,
      link: null,
    }

    this.onChange = this.onChange.bind(this);
    this.loadModel = this.loadModel.bind(this);
  }

  loadModel() {
    this.props.loadModel(this.link);
  }

  onChange(e) {
    this.setState({link:e.target.value});
  }
  render() {
    if (!this.props.display) {
      return null;
    }
    return (
      <div className="select-model-container">
        <h1>Load a Model</h1>
        <div className="model-container">
          <div className="model-new">
            <h2>New Model</h2>
            <div className="d-flex flex-wrap p-2">
              <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultModel("blank")}className="btn btn-secondary">Blank</button></div>
              <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultModel("dense")}className="btn btn-secondary">Dense</button></div>
              <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultModel("conv")}className="btn btn-secondary">Conv</button></div>
            </div>
            
          </div>
          <div className="model-blocker"></div>
          <div className="model-load">
            <h2>Load Model</h2>
            <label>Model link</label>
            <input type="text" className="form-control" placeholder="Enter model link" onChange={this.onChange}></input>
            <small className="form-text text-muted">{this.state.err}</small>
            <br></br>
            <button type="button" className="btn btn-secondary" onClick={this.loadModel}>Load</button>
          </div>
        </div>
      </div>
    );
  }
  
}