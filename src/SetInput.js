import React from 'react';
import "./SetInput.css";

export class SetInput extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      err: null,
      link: null,
    }

    this.onChange = this.onChange.bind(this);
    this.noChange = this.noChange.bind(this);
    this.setError = this.setError.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this)
  }

  setError(err) {
    this.setState({err:err})
  }

  onChange(e) {
    this.setState({link:e.target.value});
  }

  noChange(e) {
    if (e.target.id === "background-input-select" || e.target.id === "input-blocker") {
      this.props.toggle();
    }
  }

  keyDownHandler(e) {
    if (e.keyCode === 13) {
      this.props.toggle();
    }
  }

  render() {
    if (!this.props.display) {
      return null;
    }
    return (
      <div id="background-input-set" onClick={this.noChange} className="set-input-container">
      <h1>Load Input Dataset</h1>
      <div className="input-container">
        <div className="input-preset">
          <h2>Load Preset</h2>
          <div className="d-flex flex-wrap p-2">
            <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultInput("MNIST")} className="btn btn-secondary">MNIST</button></div>
            <div className="p-2"><button type="button" onClick={() => this.props.loadDefaultInput("IMDB")} className="btn btn-secondary">IMDB</button></div>
          </div>
          
        </div>
        <div id="input-blocker" className="input-blocker"></div>
        <div className="input-load">
          <h2>Load Custom</h2>
          <label>Dataset link</label>
          <input type="text" className="form-control" placeholder="Enter input URL" onChange={this.onChange} onKeyDown={this.keyDownHandler}></input>
          <small className="form-text text-muted">{this.state.err}</small>
          <br></br>
          <button type="button" className="btn btn-secondary" onClick={()=>null}>Load</button>
          <span className="input-help-button">How to Create Dataset?</span>
        </div>
      </div>
    </div>
    );
  }
}