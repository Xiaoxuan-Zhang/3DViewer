var vertex =`#version 300 es
  precision mediump float;
  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_projection;
  uniform mat4 u_normalMatrix;

  in vec4 a_position;
  in vec3 a_normal;
  in vec2 a_texCoord;

  out vec2 v_texCoord;
  out vec3 v_normal;
  out vec3 v_fragPos;

  void main(){
    gl_Position = u_projection * u_view * u_model * a_position;
    v_normal = mat3(u_normalMatrix) * a_normal; //Transform to world space
    v_fragPos = vec3(u_model * a_position); //Transform to world space
    v_texCoord = a_texCoord;
  }
  `;

var fragment = `#version 300 es
  precision mediump float;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform vec3 u_lightColor;
  uniform vec3 u_color;
  uniform sampler2D u_sample;

  in vec3 v_normal;
  in vec3 v_fragPos;
  in vec2 v_texCoord;
  out vec4 outColor;
  void main(){
    vec3 normal = normalize(v_normal);
    //calculate ambient light
    vec3 ambientColor = 0.05 * u_lightColor * u_color;
    vec3 diffColor = u_color;
    //calculate diffuse light
    vec3 lightDir = normalize(u_lightPos - v_fragPos);
    float nDotL = max(dot(lightDir, normal), 0.0);
    vec3 diffuseColor = diffColor * nDotL;
    //calculate specular light
    vec3 viewDir = normalize(u_cameraPos-v_fragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(reflectDir, viewDir), 0.0), 64.0);
    vec3 specularColor = u_lightColor * spec;
    outColor = vec4(ambientColor + diffuseColor + specularColor , 1.0);
  }
  `;
  
export default {
  vertex,
  fragment
}
