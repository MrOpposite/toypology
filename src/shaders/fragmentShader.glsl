precision highp float;
precision highp int;
#if NUM_CLIPPING_PLANES > 0
  uniform vec4 clippingPlanes[NUM_CLIPPING_PLANES ];
  varying vec3 vViewPosition;
#endif
varying vec4 vFrontColor;
varying vec4 vBackColor;

void main() {
  #if NUM_CLIPPING_PLANES > 0

    for ( int i = 0; i < UNION_CLIPPING_PLANES; ++ i ) {

      vec4 plane = clippingPlanes[ i ];
      if ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;

    }

    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

      bool clipped = true;
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; ++ i ) {
        vec4 plane = clippingPlanes[ i ];
        clipped = ( dot( vViewPosition, plane.xyz ) > plane.w ) && clipped;
      }

      if ( clipped ) discard;

    #endif

  #endif
  gl_FragColor = vFrontColor*float(gl_FrontFacing)+vBackColor*float(!gl_FrontFacing);
}
