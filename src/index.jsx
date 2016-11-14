import React from 'react';
import {render} from 'react-dom';
import ThreeDView from './3DView.jsx';

import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentRotX: 0,
      currentRotY: 0,
      currentRotZ: 0,
    };

    this.changeRotX = this.changeRotX.bind(this);
    this.changeRotY = this.changeRotY.bind(this);
    this.changeRotZ = this.changeRotZ.bind(this);
  }

  changeRotX(newVal) {
    this.setState({currentRotX: newVal.target.value})
  }

  changeRotY(newVal) {
    this.setState({currentRotY: newVal.target.value})
  }

  changeRotZ(newVal) {
    this.setState({currentRotZ: newVal.target.value})
  }

  render () {
    return (
      <div>
        <ThreeDView width={window.innerWidth} height={768} xrot={this.state.currentRotX} yrot={this.state.currentRotY} zrot={this.state.currentRotZ}/>
        <input
          type="range"
          value={this.state.currentRotX}
          max={2*Math.PI}
          step={2*Math.PI/720}
          min={0}
          onInput={this.changeRotX}
          style={{width: 1024}} />
        <input
          type="range"
          value={this.state.currentRotY}
          max={2*Math.PI}
          step={2*Math.PI/720}
          min={0}
          onInput={this.changeRotY}
          style={{width: 1024}} />
        <input
          type="range"
          value={this.state.currentRotZ}
          max={2*Math.PI}
          step={2*Math.PI/720}
          min={0}
          onInput={this.changeRotZ}
          style={{width: 1024}} />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
