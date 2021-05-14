import vertex from "src/WebGL/shaders/shadertoy_vertex.js";

var fragment = `#version 300 es
precision mediump float;

uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_resolution;
uniform samplerCube u_cubemap;

in vec2 v_texCoord;
in vec3 v_normal;
in vec4 v_fragPos;
out vec4 fragColor;

// Convert to shadertoy namings
#define iMouse u_mouse
#define iResolution u_resolution
#define iTime u_time

#define PI 3.1415926
#define MAX_STEP 60
#define MAX_DIST 40.0
#define EPSILON 0.0001
#define GLOW_COLOR0 vec3(1.0,0.0,0.3)
#define GLOW_COLOR1 vec3(0.0,0.3,1.0)
#define SURFACE_COLOR vec3(0.0,1.0,1.0)
#define AA 2
float sdSphere( in vec3 pos, in float r )
{
    return length(pos) - r;
}

float sdOctahedron( in vec3 p, in float s)
{
    p = abs(p);
    float m = p.x+p.y+p.z-s;
    vec3 q;
         if( 3.0*p.x < m ) q = p.xyz;
    else if( 3.0*p.y < m ) q = p.yzx;
    else if( 3.0*p.z < m ) q = p.zxy;
    else return m*0.57735027;
    
    float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
    return length(vec3(q.x,q.y-s+k,q.z-k)); 
}

vec2 opUnion( vec2 d1, vec2 d2 ) 
{  
    return d1.x<d2.x? d1:d2; 
}

vec3 map( in vec3 pos )
{
    vec3 p = pos;
    
    vec2 d0 = vec2(sdOctahedron(p,3.0), 1.0);
    
    vec2 d1 = vec2(sdSphere( p-vec3(0.0,1.2,0.0),2.0 ), 2.5);
    d1 += 0.2*sin(2.0*p.x+iTime);
    d1 *= 0.8;
    
    
    d0 = opUnion(d0, d1);
    
    
    vec3 rst = vec3(d0, 0.0);
    
    return rst;
}

vec3 raymarch( in vec3 ro, in vec3 rd )
{
    vec3 rst = vec3(0.0, -1.0, MAX_DIST);
    float t = 0.01;
    float minDist = MAX_DIST;
    for ( int i = 0; i < MAX_STEP; ++i )
    {
        vec3 p = ro + t * rd;
        vec3 dist = map(p);
        minDist = min(minDist, dist.x/t);
        if ( abs(dist.x)<EPSILON || t>MAX_DIST) break;
        
        t += dist.x; 
        rst = vec3(t, dist.y, minDist);
    }
    
    if ( t>MAX_DIST )
    {
        rst= vec3(MAX_DIST, -1.0, minDist);
    }
    
    return rst;
}

vec3 getNormal( in vec3 pos )
{
    vec2 offset = vec2(EPSILON, 0.0);
    return normalize( vec3(map(pos+offset.xyy).x - map(pos-offset.xyy).x,
                           map(pos+offset.yxy).x - map(pos-offset.yxy).x,
                           map(pos+offset.yyx).x - map(pos-offset.yyx).x) );
}

vec3 shading( in vec3 ro, in vec3 rd, in vec3 hit, in vec3 pixCol )
{
    vec3 outCol = vec3(0.0);
    vec3 pos = ro+hit.x*rd;
    vec3 nor = getNormal(pos);
    vec3 lightDir = normalize(vec3(0.5, 0.5, 0.5));
    float diff = max(dot(lightDir, nor), 0.0);
    if (hit.y == 1.0)
    {
        outCol += SURFACE_COLOR*diff;
    } else
    {
        outCol += pixCol*SURFACE_COLOR;//sphere
    }
    return outCol;
}

mat3 getCamera( in vec3 ta, in vec3 ro )
{
    vec3 ww = normalize(ta-ro);
    vec3 uu = normalize(cross(ww, vec3(0.0,1.0,0.0)));
    vec3 vv = normalize(cross(uu,ww));
    return mat3(uu,vv,ww);
}

vec3 render( in vec2 fragCoord )
{
    vec3 col = vec3(0.0);
    vec2 uv = u_texCoord;
    uv.x *= iResolution.x/iResolution.y;
    
    vec2 mouse = iMouse.xy/iResolution.xy;
    float aTime = iTime*0.4;
    vec3 ro = vec3(8.0*cos(aTime+mouse.x*6.28),mouse.y*2.0,8.0*sin(aTime+mouse.x*6.28));
    vec3 ta = vec3(0.0,0.0,0.0);
    mat3 cam = getCamera(ta,ro);
    vec3 rd = cam*(vec3(uv,0.9));
    
    vec3 tex = texture(u_cubemap,rd).rgb;
    vec3 backCol = vec3(tex.r*tex.g*tex.b);
    col += backCol*backCol*backCol;
    vec3 hit = raymarch(ro,rd);
       
    if ( hit.y>0.0 )
    {
        col = shading( ro, rd, hit, col )*2.0;
    }
    float glow0 = exp(-24.0*hit.z);
    float glow1 = exp(-16.0*hit.z);
    vec3 glowCol = vec3(0.0);
    float t = fract(iTime*0.5);
    float y = 3.0*t*(1.0-t); 
    
    glowCol += 0.5*GLOW_COLOR1*glow0*y;  
    glowCol += 0.5*GLOW_COLOR1*glow1; 
    glowCol += 0.2*GLOW_COLOR0*exp(-8.0*hit.z); 
    
    glowCol *= 0.5+0.5*y;
    return col+glowCol*0.8;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    
    vec3 col = vec3(0.0);
    for ( float j = 0.0; j < float(AA); ++j )
    {
        for ( float i = 0.0; i < float(AA); ++i )
        {
            vec2 off = -0.5+vec2(j,i)/float(AA);
            col += render(fragCoord+off);
        }
    }
    
    col /= float(AA*AA);
    
    col = pow( col, vec3(0.4546));
    // vignetting        
    vec2 q = v_texCoord;
    col *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.25);
    
    fragColor = vec4(col,1.0);
}

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}

`;

export default {
    vertex,
    fragment
}