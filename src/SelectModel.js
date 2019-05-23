import React from 'react';
import "./SelectModel.css";

export class SelectModel extends React.Component {
  /* the page selecting a model */
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      err: null,
      link: null,
    }

    this.onChange = this.onChange.bind(this);
    this.noChange = this.noChange.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.setError = this.setError.bind(this);
  }

  setError(err) {
    /* set local error (to be displayed as small text) */
    this.setState({err:err})
  }

  loadModel() {
    /* load a custom model */
    this.props.loadModel(this.state.link, this.setError);
  }

  onChange(e) {
    /* when the textbox is editted */
    this.setState({link:e.target.value});
  }

  noChange(e) {
    /* the model selection is cancelled and nothing is done 
     * if the user clicks on the background
     */
    if (e.target.id === "background-model-select" || e.target.id === "model-blocker") {
      this.props.toggle();
    }
  }
  render() {
    // empty if not displaying
    if (!this.props.display) {
      return null;
    }
    return (
      <div id="background-model-select" onClick={this.noChange} className="select-model-container">
        <h1>Load a Model</h1>
        <div className="model-container">
          <div className="model-new">
            <h2>New Model</h2>
            <div className="d-flex flex-wrap p-2">
              <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultModel("blank")} className="btn btn-secondary">Blank</button></div>
              <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultModel("dense")} className="btn btn-secondary">Dense</button></div>
              <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultModel("conv")} className="btn btn-secondary">Conv</button></div>
            </div>
            
          </div>
          <div id="model-blocker" className="model-blocker"></div>
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