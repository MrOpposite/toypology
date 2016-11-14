import React from 'react';
import * as THREE from 'three';
import ReactDOM from 'react-dom';
import VertexShaderSource from './shaders/vertexShader.glsl';
import FragmentShaderSource from './shaders/fragmentShader.glsl';
import VertexShaderQuadSource from './shaders/vertexShaderQuad.glsl';
import FragmentShaderAccumulationSource from './shaders/fragmentShaderAccumulation.glsl';
import FragmentShaderRevealageSource from './shaders/fragmentShaderRevealage.glsl';
import FragmentShaderCompositingSource from './shaders/fragmentShaderCompositing.glsl'

function OitRenderer( threeObject, props ){
    var renderer = threeObject.renderer;
    var side = threeObject.side;
    var dualColor = threeObject.dualColor;
    // accumulation shader
    var accumulationMaterial = new THREE.ShaderMaterial( {
      vertexShader: VertexShaderSource,
      fragmentShader: FragmentShaderAccumulationSource,
      uniforms: {dualColor: {value: dualColor}},
      side: side,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor
    });
    accumulationMaterial.clipping = true;
    accumulationMaterial.clippingPlanes = threeObject.clippingPlanes;
    var accumulationTexture = new THREE.WebGLRenderTarget(
      props.width, props.height,
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
      }
    );
    // revelage shader
    var revealageMaterial = new THREE.ShaderMaterial( {
      vertexShader: VertexShaderSource,
      fragmentShader: FragmentShaderRevealageSource,
      uniforms: {dualColor: {value: dualColor}},
      side: side,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.ZeroFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor
    });
    revealageMaterial.clipping = true;
    revealageMaterial.clippingPlanes = threeObject.clippingPlanes;
    var revealageTexture = new THREE.WebGLRenderTarget(
      props.width, props.height,
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
      }
    );
    // compositing shader
    var compositingUniforms = {
      "tAccumulation": { type: "t", value: null },
      "tRevealage": { type: "t", value: null }
    };
    var compositingMaterial = new THREE.ShaderMaterial({
      uniforms: compositingUniforms,
      vertexShader: VertexShaderQuadSource,
      fragmentShader: FragmentShaderCompositingSource,
      transparent: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneMinusSrcAlphaFactor,
      blendDst: THREE.SrcAlphaFactor
    });
    var quadCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    var quadScene  = new THREE.Scene();
    quadScene.add( new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), compositingMaterial ) );
    // events
    function onWindowResize(){
        // FIXME results in distorted image
        // accumulationTexture.setSize( window.innerWidth, window.innerHeight );
        // revealageTexture.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );
    // background color
    var clearColor = new THREE.Color( 0, 0, 0 );
    this.setClearColor = function( newClearColor ){
        clearColor = newClearColor;
    }
    this.render = function( scene, camera ){
        renderer.setClearColor( clearColor, 1.0 );
        renderer.clearColor();
        scene.overrideMaterial = accumulationMaterial;
        renderer.render( scene, camera, accumulationTexture );
        scene.overrideMaterial = revealageMaterial;
        renderer.render( scene, camera, revealageTexture );
        compositingUniforms[ "tAccumulation" ].value = accumulationTexture.texture;
        compositingUniforms[ "tRevealage" ].value = revealageTexture.texture;
        renderer.render( quadScene, quadCamera );
        scene.overrideMaterial = null;
    }
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}

class ThreeDView extends React.Component {
  constructor(props) {
    super(props);
    this.dragging = {active: -1, x: 0, y: 0};

    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.moveDrag = this.moveDrag.bind(this);
    this.preventContext = this.preventContext.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
  }

  componentDidMount() {
    console.log("THREE",THREE);
    var props = this.props;
    var threeObject = this.threeObject = {};
    var dualColor = threeObject.dualColor = false;
    var side = threeObject.side = THREE.FrontSide;
    var origin = threeObject.origin = new THREE.Vector3(0, 0, 0);
    var cameraPosition = threeObject.cameraPosition = new THREE.Vector3(0, 0, 30);
    var clippingPlanes = threeObject.clippingPlanes = [/*new THREE.Plane(new THREE.Vector3(0,0,1), 0)*/];
    var renderer = threeObject.renderer = new THREE.WebGLRenderer({canvas: ReactDOM.findDOMNode(this)});
    console.log("renderer",renderer);
    var gl = renderer.context;
    console.log("gl",gl);
    var scene = threeObject.scene = new THREE.Scene();
    var camera = threeObject.camera = new THREE.PerspectiveCamera( 75, props.width/props.height, 0.1, 1000 );
    //var controls = new THREE.OrbitControls( camera, renderer.domElement );
    var geometry = threeObject.geometry = new THREE.TorusBufferGeometry(10,3,16,100);
    console.log("GEOMETRY",geometry);
    var frontColors = new Float32Array((geometry.attributes.position.array.length/3)*4, 4);
    // center quad (yellow)
    for ( let i = 0; i < Math.floor(frontColors.length/4); i++ ) {

      frontColors.set([ geometry.attributes.position.array[i*3+2]/10, 1, 1, 1 ], i*4 );
    }
    geometry.addAttribute( 'frontColor', new THREE.BufferAttribute( frontColors, 4 ) );
    var backColors = new Float32Array((geometry.attributes.position.array.length/3)*4, 4);
    // center quad (yellow)
    for ( let i = 0; i < Math.floor(backColors.length/4); i++ ) {
      backColors.set([ 0.5, 1, 0, 1 ], i*4 );
    }
    geometry.addAttribute( 'backColor', new THREE.BufferAttribute( backColors, 4 ) );

    var material = threeObject.material = new THREE.ShaderMaterial( {
      vertexShader: VertexShaderSource,
      fragmentShader: FragmentShaderSource,
      uniforms: {dualColor: {value: dualColor}},
      side: side,
    });

    //material = new THREE.MeshPhongMaterial();
    material.clipping = true;
    material.clippingPlanes = clippingPlanes;

    var cube = threeObject.cube = new THREE.Mesh( geometry, material );
    cube.doubleSided = true;

    camera.position.copy(cameraPosition);
    camera.lookAt(origin);

    scene.add( cube );
    scene.add( new THREE.AmbientLight( 0xfff ) );
    /*renderer.setClearColor('green');
    oitPass.setClearColor('green');*/
    renderer.setSize( props.width, props.height );
    renderer.localClippingEnabled = true;

    var oitPass = threeObject.oitPass = new OitRenderer( threeObject, props );
    console.log("OIT",oitPass);
    this.renderScene();
  }

  componentWillReceiveProps(nextProps) {
    this.threeObject.cube.rotation.x = nextProps.xrot;
    this.threeObject.cube.rotation.y = nextProps.yrot;
    this.threeObject.cube.rotation.z = nextProps.zrot;
  }

  renderScene() {
    if(!this.threeObject)
      return;
    this.threeObject.oitPass.render(this.threeObject.scene,this.threeObject.camera);
  }

  componentWillMount () {
    document.addEventListener('mouseup', this.stopDrag, false);
    document.addEventListener('mousemove', this.moveDrag, false);
  }

  componentWillUnmount () {
    document.removeEventListener('mouseup', this.stopDrag, false);
    document.removeEventListener('mousemove', this.moveDrag, false);
    document.removeEventListener('contextmenu', this.preventContext, true);
  }

  startDrag(event) {
    if(event.button !== 0 && event.button !== 2)
      return;
    this.dragging.active = event.button;
    this.dragging.x = event.screenX;
    this.dragging.y = event.screenY;
    console.log("START",event);
  }

  stopDrag(event) {
    if(event.button !== this.dragging.active)
      return;

    if(event.button === 2) {
      document.addEventListener('contextmenu', this.preventContext, true);
    }
    this.dragging.active = -1;
  }

  moveDrag(event) {
    if(this.dragging.active === -1)
      return;
    var dx = event.screenX - this.dragging.x;
    var dy = event.screenY - this.dragging.y;
    this.dragging.x = event.screenX;
    this.dragging.y = event.screenY;
    var camera = this.threeObject.camera;
    if(this.dragging.active === 0) {
      var deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        toRadians(-dy * .1),
        0,
        toRadians(dx * .1),
        'XYZ'
      ));
      camera.quaternion.multiplyQuaternions(deltaRotationQuaternion,camera.quaternion);
    } else if(this.dragging.active === 2) {
      camera.translateX(dx/5);
      camera.translateY(dy/5);
    }
    event.preventDefault()
    this.forceUpdate();
  }

  handleZoom(event) {
    event.preventDefault();
    event.persist();
    var camera = this.threeObject.camera;
    camera.translateZ(Math.sign(event.deltaY)*5);
    this.forceUpdate();
    console.log(event);
  }

  preventContext(event) {
    event.preventDefault();
    document.removeEventListener('contextmenu', this.preventContext, true);
  }

  render () {
    this.renderScene();
    return <canvas onMouseDown={this.startDrag} onWheel={this.handleZoom} width={this.props.width} height={this.props.height}/>;
  }

}
ThreeDView.defaultProps = {
   xrot: 0,
   yrot: 0,
   zrot: 0,
   width: 2,
   height: 2,
 };
export default ThreeDView;
