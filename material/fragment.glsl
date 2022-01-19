precision highp float;
uniform float time;
uniform float yMax;

varying vec3 vUv;

float random(vec2 ab) {
    float f = (cos(dot(ab ,vec2(21.9898,78.233))) * 43758.5453);
    return fract(f);
}

void main() {
    float alpha = (yMax - vUv.y) * 0.8;
    float red = 1.0;
    float green = 0.3 + (0.7 * mix(((yMax - vUv.y) * 0.5) + 0.5, 0.5 - abs(max(vUv.x, vUv.y)), 0.5));
    float blueMin = abs(max(max(vUv.x, vUv.z), (vUv.y / yMax)));
    float blue = (1.0 / (blueMin + 0.5)) - 1.0;

    gl_FragColor = vec4(red, green, blue, alpha);
}
