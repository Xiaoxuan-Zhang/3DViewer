const vertex =
  `#version 300 es
  precision mediump float;
  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_projection;
  uniform mat4 u_normalMatrix;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform sampler2D u_normal;

  in vec4 a_position;
  in vec3 a_normal;
  in vec2 a_texCoord;

  out vec2 v_texCoord;
  out vec3 v_normal;
  out vec3 v_fragPos;
  out vec3 v_lightPos;
  out vec3 v_cameraPos;

  void main(){
    gl_Position = u_projection * u_view * u_model * a_position;
    vec3 texNor = texture(u_normal, v_texCoord).rgb;
    v_normal = mat3(u_normalMatrix) * a_normal; //Transform to model space
    v_fragPos = vec3(u_model * a_position); //Transform to model space
    v_lightPos = vec3(u_model * vec4(u_lightPos, 1.0)); //Transform to model space
    v_cameraPos = vec3(u_model * vec4(u_cameraPos, 1.0));
    v_texCoord = a_texCoord;
  }
  `;

const fragment =
  `#version 300 es
  precision mediump float;

  uniform vec3 u_lightColor;
  uniform vec3 u_specularColor;
  uniform sampler2D u_sample;
  uniform sampler2D u_specular;

  in vec3 v_normal;
  in vec3 v_fragPos;
  in vec3 v_lightPos;
  in vec3 v_cameraPos;
  in vec2 v_texCoord;
  out vec4 outColor;
  void main(){
    vec3 texDiff = texture(u_sample, v_texCoord).rgb;
    vec3 texSpec = texture(u_specular, v_texCoord).rgb;

    vec3 normal = normalize(v_normal);
    //calculate ambient light
    vec3 ambientColor = 0.05 * u_lightColor * texDiff;
    //calculate diffuse light
    vec3 lightDir = normalize(v_lightPos - v_fragPos);
    float nDotL = max(dot(lightDir, normal), 0.0);
    vec3 diffuseColor = texDiff * nDotL;
    //calculate specular light
    vec3 viewDir = normalize(v_cameraPos-v_fragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(reflectDir, viewDir), 0.0), 64.0);
    vec3 specularColor = u_specularColor * spec * texSpec.r;
    outColor = vec4(ambientColor + diffuseColor + specularColor , 1.0);
  }
  `;
  
export default {
  vertex,
  fragment
}
