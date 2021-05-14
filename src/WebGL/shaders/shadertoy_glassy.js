import vertex from "src/WebGL/shaders/shadertoy_vertex.js";

var fragment = `#version 300 es
precision mediump float;

uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_resolution;
uniform samplerCube u_cubemap;
uniform sampler2D u_sample;

in vec2 v_texCoord;
in vec3 v_normal;
in vec4 v_fragPos;
out vec4 fragColor;

// Convert to shadertoy namings
#define iMouse u_mouse
#define iResolution u_resolution
#define iTime u_time

#define PI 3.1415926
#define EPSILON 0.001
const int MAX_STEPS = 120;
const float MAX_DISTANCE = 100.0;
const float AA_SIZE = 2.0;
const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 1.0);

vec3 light_position;

float plane(vec3 p) 
{
    return p.y;
}

float displacement (vec3 p) 
{
    return sin(p.y) * 1.5;
}

float sphereSDF(vec3 p, float r) 
{
    return length(p) - r;
}

float dot2(in vec2 v) {
    return dot(v, v);
}
float sdCappedCone( in vec3 p, in float h, in float r1, in float r2 )
{
    vec2 q = vec2( length(p.xz), p.y );
    
    vec2 k1 = vec2(r2,h);
    vec2 k2 = vec2(r2-r1,2.0*h);
    vec2 ca = vec2(q.x-min(q.x,(q.y < 0.0)?r1:r2), abs(q.y)-h);
    vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)/dot2(k2), 0.0, 1.0 );
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s*sqrt( min(dot2(ca),dot2(cb)) );
}

vec2 unionSDF(vec2 d1, vec2 d2) 
{
    return d1.x < d2.x? d1 : d2;
}

vec3 doTranslate(vec3 p, vec3 offset) 
{
    return p - offset;
}

vec2 sceneSDF(vec3 p) 
{
    vec2 result0 = vec2(plane(p), -1.0);
    
    vec3 p1= doTranslate(p,vec3(0.0, 3.0 , 0.0));
    vec2 result1 = vec2(sphereSDF( p1 , 2.5) + displacement(p1), 2.0);
    result1.x *= 0.5;
    
    vec3 p2= doTranslate(p,vec3(3.0, 3.5 , 0.0));
    vec2 result2 = vec2(sphereSDF( p2 , 2.5), 2.0);
    
    vec3 p3 = doTranslate(p,vec3(0.0, 0.0 , 0.0));
    vec2 result3 = vec2(sdCappedCone(p3, 1.5, 3.0, 2.2), 3.0);  
    
    
    vec2 result = unionSDF(result0, result1);
    //result = unionSDF(result, result2);
    //result = unionSDF(result, result3);
    return result;
}

vec2 marching(vec3 ro, vec3 rd) 
{
    float tmax = MAX_DISTANCE;
    float t = 0.001;
    vec2 result = vec2(-1.0);
    
    for (int i = 0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + rd * t;
        vec2 res = sceneSDF(p);
        if (res.x < EPSILON)
        {
            return result;
        }
        else if (t > tmax)
        {
            result.y = -1.0;
            result.x = tmax;
            break;
        }
        t += res.x;
        result.x = t;
        result.y = res.y;
    }
    
    return result;
}

float calcShadow(in vec3 ro, in vec3 rd) {
    float mint = 0.1;
    float t = mint;
    float res = 1.0;
    float k = 4.0;
    for (int i = 0; i < 40; i++)
    {
        float h = sceneSDF(ro + rd * t).x;
        
		res = min( res, k * h / t );
        t += clamp( h, 0.02, 0.20 );
     
        if ( h < EPSILON ) 
        {
            res = min(res, 0.0);
            break;
        } 
    }
    return clamp( res, 0.0, 1.0 );
}

float calcAO( in vec3 pos, in vec3 nor )
{
	float occ = 0.0;
    float sca = 1.0;
    //float k = 5.0; 
    float h = 0.001;
    for( float i = 0.0; i < 5.0; i++ )
    {
        float d = sceneSDF( pos + h * nor ).x;
        occ += ( h - d ) * sca;
        sca *= 0.9;
        h += 0.45 * i / 5.0;
    }
    return clamp( 1.0 - occ, 0.0, 1.0 );    
}

vec2 OFFSET = vec2(EPSILON, 0.0);
vec3 getNormal(vec3 p) {
    return normalize(vec3(
        sceneSDF(p + OFFSET.xyy).x - sceneSDF(p - OFFSET.xyy).x,
        sceneSDF(p + OFFSET.yxy).x - sceneSDF(p - OFFSET.yxy).x,
        sceneSDF(p + OFFSET.yyx).x - sceneSDF(p - OFFSET.yyx).x
    ));
}

vec3 shading(vec3 ro, vec3 p, float objId) 
{
    vec3 outCol = vec3(0.0);
    vec3 lightPos = light_position; 
    vec3 viewDir = ro - p;
    vec3 lightDir = lightPos - p;
    float dist = length(lightDir);
    
    vec3 nor = vec3(0.0);
    nor = getNormal(p);
    vec3 diffCol = LIGHT_COLOR;
    if (objId == -1.0) 
    {//floor
        vec2 offset = vec2(0.002, 0.0);
        vec2 floorUV = p.xz * 5.0/MAX_DISTANCE;
        diffCol = texture(u_sample, floorUV).rgb; 
        float dx = texture(u_sample, floorUV + offset.xy).r 
            	 - texture(u_sample, floorUV - offset.xy).r ;
        float dz = texture(u_sample, floorUV + offset.yx).r 
            	 - texture(u_sample, floorUV - offset.yx).r ;
        nor = normalize(vec3(dx, 1.0, dz ));
    } 
    vec3 N = nor;
    vec3 I = normalize(viewDir);
    vec3 L = normalize(lightDir);
    vec3 R = normalize(reflect(-L, N));
    vec3 RV = normalize(reflect(-I, N));

    float ao = calcAO(p, N) ;
    vec3 ambient = LIGHT_COLOR * ao * 0.3;
    float diff = max(dot(L, N), 0.0);
    float sd = calcShadow(p, normalize(lightPos));
     
    vec3 diffuse = diffCol * diff * sd * 0.5 ;
    float spec = pow(max(dot(I, R), 0.0), 16.0);
    vec3 specular = LIGHT_COLOR * spec * 0.8;
    outCol = LIGHT_COLOR * (ambient + diffuse + specular);
    
    //reflection + refraction
    vec3 refl = texture(u_cubemap, RV).rgb;
    
    float refractRatio = 0.95;
    float fresnelBias = 0.0;
    float fresnelPow = 0.2;
    float fresnelScale = 1.0;
    float reflectionFactor = clamp(fresnelBias + fresnelScale * pow( 1.0 + dot( -I, N ), fresnelPow ), 0.0, 1.0);
        
    vec3 refractR = normalize(refract(-I, N, refractRatio));
    vec3 refractG = normalize(refract(-I, N, refractRatio * 0.98));
    vec3 refractB = normalize(refract(-I, N, refractRatio * 0.96));
    
    float level = smoothstep(0.8, 1.2, p.y); //adding a bit blur
    //if (p.y > 1.0)
    //{
        vec3 refractCol = vec3(1.0);
        refractCol.r = texture(u_cubemap, refractR).r;
        refractCol.g = texture(u_cubemap, refractG).g;
        refractCol.b = texture(u_cubemap, refractB).b;
        vec3 fr = mix(refl, refractCol, reflectionFactor);
        outCol = mix(outCol, fr, level);
    //}
    
    return outCol;
}

mat3 getCamera( in vec3 ro, in vec3 ta)
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(0.0, 1.0, 0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv =          ( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

vec3 render(in vec2 fragCoord) 
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    uv -= 0.5; // translate to the center of the screen
    uv.x *= iResolution.x/iResolution.y; // restore aspect ratio
    
    vec3 col = vec3(0.0);
    vec2 mouse = vec2(0.01) + iMouse.xy  / iResolution.xy ;
    mouse -= 0.5;
    float t = iTime * 0.1;
    
    vec3 ro = vec3(10.0 * cos(mouse.x * 2.0 * PI + t), 2.0 + mouse.y * 4.0, 10.0 * sin(mouse.x * 2.0 * PI + t));
    //vec3 ro = vec3(0.0, 5.0, 10.0);
    vec3 ta = vec3(0.0, 2.0, 0.0);
    mat3 cam = getCamera(ro, ta);
    vec3 rd = normalize(cam * vec3(uv, 1.0));
    
    vec2 h = marching(ro, rd);
    vec3 p = ro + rd * h.x;
    if (h.x < MAX_DISTANCE) 
    {
        col += shading(ro, p, h.y);
    } else 
    {
        col += texture(u_cubemap, rd).rgb;
    }
    
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 col = vec3(0.0);
    float count = 0.0;
    light_position = vec3(0.0, 10.0, 4.0);
    for (float aay = 0.0; aay < AA_SIZE; aay++) 
    {
        for (float aax = 0.0; aax < AA_SIZE; aax++) 
        {
            col += render(fragCoord + vec2(aax, aay)/AA_SIZE);
            count++;
        }
    }
    
    col /= count;
    fragColor = vec4(col, 1.0);
}
void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}

`;

export default {
    vertex,
    fragment
}