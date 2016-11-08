import React from 'react';
import {render} from 'react-dom';
import ThreeDView from './3DView.jsx';

class App extends React.Component {
  render () {
    return (
      <div>
        <p> Hello React!</p>
        <ThreeDView width="1024" height="768" />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
