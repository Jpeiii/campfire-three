precision highp float;

#define PI 3.1415926535897932384626433832795

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;
uniform float size;

attribute vec3 position;
attribute vec3 direction;
attribute float offset;

varying vec3 vUv;

void main() {
    float sawTime = mod(time * offset, PI);
    float sineTime = (sawTime * abs(sin(time * offset)));

    vec3 timeVec = vec3(sineTime, sawTime, sineTime);

    vUv = ((normalize(position) * 0.2) + (timeVec * direction)) * size;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vUv, 1.0 );
}
