var vertex = `#version 300 es
#pragma vscode_glsllint_stage : vert
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

void main(){
  gl_Position = u_projection * u_view * u_model * a_position;
  vec3 texNor = texture(u_normal, v_texCoord).rgb;
  v_normal = mat3(u_normalMatrix) * a_normal; //Transform to world space
  v_fragPos = vec3(u_model * a_position); //Transform to world space
  v_texCoord = a_texCoord;
}
`;

var fragment = `#version 300 es
#pragma vscode_glsllint_stage : frag
precision mediump float;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;
uniform sampler2D u_color;
uniform sampler2D u_metallic;
uniform sampler2D u_roughness;
uniform sampler2D u_ao;
uniform sampler2D u_emission;
uniform sampler2D u_normal;

in vec3 v_normal;
in vec3 v_fragPos;
in vec2 v_texCoord;
out vec4 outColor;

#define PI 3.1415926

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(max(1.0 - cosTheta, 0.0), 5.0);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    return num / denom;
}

float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = r * r / 8.0;
    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    return num / denom;
}

float geometrySmith(float NdotV, float NdotL, float roughness) {
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);
    return ggx1 * ggx2;
}

vec3 calcLight(vec3 N, vec3 V, vec3 albedo) {
    vec3 Lo = vec3(0.0);
    vec3 F0 = vec3(0.04);
    float metallic = texture(u_metallic, v_texCoord).r;
    float roughness = texture(u_roughness, v_texCoord).r;
    F0 = mix(F0, albedo, metallic);
    vec3 light = vec3(150.0, 150.0, 120.0);
    //for (int i = 0; i < 4; ++i) 
    {
        vec3 l = u_lightPos - v_fragPos;
        vec3 L = normalize(l);
        vec3 H = normalize(V + L);
        float cosTheta = max(dot(H, V), 0.0);
        float NdotV = max(dot(N, V), 0.0);
        float NdotL = max(dot(N, L), 0.0);
        float dist = length(l);
        float atten = 1.0 / (dist * dist);
        vec3 radiance = light * atten;
        vec3 F = fresnelSchlick(cosTheta, F0);
        float NDF = distributionGGX(N, H, roughness);
        float G = geometrySmith(NdotV, NdotL, roughness);
        vec3 num = NDF * G * F;
        float denom = 4.0 * NdotV * NdotL;
        vec3 specular = num / max(denom, 0.001);

        vec3 ks = F;
        vec3 kd = 1.0 - ks;
        kd *= 1.0 - metallic;

        Lo += (kd * albedo / PI + specular) * radiance * NdotL;
    }
    return Lo;
}

void main(){
  vec3 N = normalize(v_normal);
  vec3 V = normalize(u_cameraPos - v_fragPos);
  vec3 albedo = pow(texture(u_color, v_texCoord).rgb, vec3(2.2));
  vec3 emission = texture(u_emission, v_texCoord).rgb;
  vec3 ao = texture(u_ao, v_texCoord).rgb;
  vec3 Lo = calcLight(N, V, albedo);
  vec3 ambient = vec3(0.03) * albedo * ao;
  vec3 col = Lo + ambient;
  // HDR tonemapping
  col = col / (col + vec3(1.0));
  // gamma correct
  col = pow(col, vec3(1.0/2.2)); 
  outColor = vec4(col, 1.0);
}`;

export default {
    vertex,
    fragment
}