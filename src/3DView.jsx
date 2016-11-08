import React from 'react';
import {Renderer,Scene,PerspectiveCamera,Mesh} from 'react-three';
import * as THREE from 'three';

class ThreeDView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
                  box: new THREE.BoxGeometry(1,1,1,),
                  pos: new THREE.Vector3(0,0,0),
                  mat: new THREE.MeshBasicMaterial({color: 0x00ff00})
                 };
  }

  render () {
    console.log(this.props);
    var aspectratio = this.props.width / this.props.height;
    var cameraprops = {fov : 75, aspect : aspectratio,
                       near : 1, far : 5000,
                       position : new THREE.Vector3(0,0,600),
                       lookat : new THREE.Vector3(0,0,0)};

    return <Renderer width={this.props.width} height={this.props.height}>
      <Scene width={this.props.width} height={this.props.height} camera="maincamera">
        <PerspectiveCamera name="maincamera" {...cameraprops} />
        <Mesh position={new THREE.Vector3(0,0,0)} material={this.state.box}></Mesh>
        </Scene>
    </Renderer>;
  }

}

export default ThreeDView;
