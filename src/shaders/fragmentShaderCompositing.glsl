varying vec2 vUv;

uniform sampler2D tAccumulation;
uniform sampler2D tRevealage;
void main()
{
    vec4 accum = texture2D( tAccumulation, vUv );
    float r = texture2D( tRevealage, vUv ).r;
    gl_FragColor = vec4( accum.rgb / clamp( accum.a, 1e-4, 5e4 ), r );
}
