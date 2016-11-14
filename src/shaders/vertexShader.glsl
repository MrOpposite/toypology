//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;
//uniform mat4 viewMatrix;
//uniform mat4 modelMatrix;
//attribute vec3 position;
attribute vec4 frontColor;
attribute vec4 backColor;
uniform bool dualColor;
varying vec3 vViewPosition;
varying vec4 vFrontColor;
varying vec4 vBackColor;
varying float z;
vec4 hsva2rgba(vec4 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return vec4 (c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), c.w);
}
void main() {
    #ifdef FLIP_SIDED
    vFrontColor = hsva2rgba(backColor*float(dualColor)+frontColor*float(!dualColor));
    #elif defined(DOUBLE_SIDED)
    vFrontColor = hsva2rgba(frontColor);
    vBackColor = hsva2rgba(backColor*float(dualColor)+frontColor*float(!dualColor));
    #else
    vFrontColor = hsva2rgba(frontColor);
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vec4 z4 = modelViewMatrix * vec4( position, 1.0 );
    z = ( z4.xyz / z4.w ).z;
    z = z4.z;
    // z = gl_Position.z;
    // z = position.z;
    z = ( viewMatrix * vec4( position, 1.0 ) ).z;
    #ifdef USE_SKINNING

    vec4 mvPosition = modelViewMatrix * skinned;

    #elif defined( USE_MORPHTARGETS )

        vec4 mvPosition = modelViewMatrix * vec4( morphed, 1.0 );

    #else

        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    #endif
    vViewPosition = - mvPosition.xyz;
}
