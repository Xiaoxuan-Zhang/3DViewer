import vertex from "src/WebGL/shaders/shadertoy_vertex.js";

var fragment = `#version 300 es
precision mediump float;

uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_resolution;

in vec2 v_texCoord;
in vec3 v_normal;
in vec4 v_fragPos;
out vec4 fragColor;

// Convert to shadertoy namings
#define iMouse u_mouse
#define iResolution u_resolution
#define iTime u_time

#define ITERATION 12
#define PI 3.1416
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = 2.0*v_texCoord - 1.0;
    uv.x *= iResolution.x/iResolution.y; 
    vec2 mo = iMouse.xy/iResolution.xy;
    
    float ti = iTime * 0.2;
    ivec2 txy = ivec2(fragCoord.xy/iResolution.xy);
    vec2 c = vec2(0.45*cos(PI*mo.x + ti*0.5), 0.45*sin(PI*mo.y + ti*0.5));
    c += 0.5;
    
    vec2 p = uv;  
    float len = length(p);
    float r = 0.0, g = 0.0, b = 0.0;
    
 	vec3 col = vec3(0.0);
    for (int i = 0; i < ITERATION; ++i) {
        p = abs(p)/dot(p,p) - c;
        float l = len;
        len = length(p);
        l = len - l;
        
        col +=  l * len * vec3(sin(1.2*ti + 10.0), cos(1.8*ti + 12.0), sin(-1.2*ti));
    	col = 1.0 - exp(-0.04*col);
    }
    
    col = pow(col, vec3(1.0/2.2));
    // Output to screen
    fragColor = vec4(col ,1.0);
}

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}

`;

export default {
    vertex,
    fragment
}
