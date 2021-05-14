import vertex from "src/WebGL/shaders/shadertoy_vertex.js";

var fragment =
`#version 300 es
precision mediump float;
uniform sampler2D u_sample;
uniform vec2 u_mouse;
uniform float u_time;
in vec2 v_texCoord;
in vec3 v_normal;
in vec4 v_fragPos;
out vec4 outColor;

void main(){
  vec3 color = texture(u_sample, v_texCoord).rgb;
  outColor = vec4(u_mouse, 0.0, 1.0);
}
`;

export default {
  vertex,
  fragment
}