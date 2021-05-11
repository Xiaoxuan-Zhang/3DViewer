var vertex =
`#version 300 es
  precision mediump float;
  in vec4 a_position;
  in vec2 a_texCoord;
  in vec3 a_normal;
  out vec2 v_texCoord;
  out vec3 v_normal;
  out vec4 v_fragPos;

  void main(){
    gl_Position = a_position;
    v_texCoord = a_texCoord;
    v_normal = a_normal;
    v_fragPos = a_position;
  }
`;

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