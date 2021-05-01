var vertex =
`#version 300 es
  precision mediump float;
  in vec4 a_position;
  in vec2 a_texCoord;
  in vec3 a_normal;
  out vec2 v_texCoord;
  out vec3 v_normal;

  void main(){
    gl_Position = a_position;
    v_texCoord = a_texCoord;
    v_normal = a_normal;
  }
`;

var fragment =
`#version 300 es
precision mediump float;
uniform sampler2D u_sample;
uniform sampler2D u_depth;
uniform float u_near;
uniform float u_far;
uniform float u_fog;
uniform vec3 u_fogColor;
in vec2 v_texCoord;
in vec3 v_normal;
out vec4 outColor;

float perspectiveDepth() {
  vec4 texDepth = texture(u_depth, v_texCoord);
  float depth = texDepth.r;
  float z = depth * 2.0 - 1.0; // Back to NDC
  float near = u_near;
  float far = u_far;
  depth = (2.0 * near * far) / (far + near - z * (far - near));
  depth /= far;
  return depth;
}

void main(){
  vec3 texColor = texture(u_sample, v_texCoord).rgb;
  float depth = perspectiveDepth();
  //float depth = texture(u_depth, v_texCoord).r;
  //unfog skybox
  if (depth > 0.99) {
    depth = 0.4;
  }
  vec3 fogColor = u_fogColor / 255.0;
  float b = u_fog;
  float fogAmount = exp(-b*depth);
  vec3 color = mix(fogColor, texColor, fogAmount);
  outColor = vec4(color, 1.0);
}
`;

export default {
  vertex,
  fragment
}