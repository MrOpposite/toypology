precision highp float;
precision highp int;
#if NUM_CLIPPING_PLANES > 0
  uniform vec4 clippingPlanes[NUM_CLIPPING_PLANES ];
  varying vec3 vViewPosition;
#endif
varying float z;
varying vec4 vFrontColor;
varying vec4 vBackColor;
float w( float a )
{
    // eq. 10
    // return a * max( 1e-2, 3.0 * 1e3 * pow( 1.0 - gl_FragCoord.z, 3.0 ) );
    // eq. 9
    //return a * clamp( 0.03 / ( 1e-5 + pow( abs( z ) / 200.0, 4.0 ) ), 1e-2, 3e3 );

    // weight function design
    // float colorResistance = 1.0; // 1.0
    // float rangeAdjustmentsClampBounds = 0.3; // 0.3
    // float depth = abs( 1.0 - gl_FragCoord.z ); // abs( z )
    // float orderingDiscrimination = 0.1; // 200.0
    // float orderingStrength = 4.0; // 4.0
    // float minValue = 1e-2;
    // float maxValue = 3e3;
    // return pow( a, colorResistance ) *
    //     clamp(
    //         rangeAdjustmentsClampBounds /
    //             ( 1e-5 + pow( depth / orderingDiscrimination, orderingStrength ) ),
    //         minValue, maxValue
    //     );
    float z2 = z;
    //z2 = gl_FragCoord.z;
    // eq. 7
    return pow( a, 1.0 ) * clamp( 10.0 / ( 1e-5 + pow( abs( z2 ) / 5.0, 2.0 ) + pow( abs( z2 ) / 200.0, 6.0 ) ), 1e-2, 3e3 );

}
void main()
{
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
  z; // to silence 'not read' warnings
  vec4 color;
  if (gl_FrontFacing)
    color = vec4( vFrontColor );
  else
    color = vec4( vBackColor );
  float ai = color.a;
  vec3 Ci = color.rgb * ai;
  gl_FragColor = vec4( Ci, ai ) * w( ai );
}
