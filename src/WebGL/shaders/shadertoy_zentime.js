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

var fragment = `#version 300 es
    precision mediump float;

    uniform sampler2D u_sample;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    in vec2 v_texCoord;
    in vec3 v_normal;
    in vec4 v_fragPos;
    out vec4 outColor;

    const float TURBULENCE = 0.04;
    //noise function from iq: https://www.shadertoy.com/view/Msf3WH
    vec2 hash( vec2 p ) 
    {
        p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }

    float noise( in vec2 p )
    {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;

        vec2  i = floor( p + (p.x+p.y)*K1 );
        vec2  a = p - i + (i.x+i.y)*K2;
        float m = step(a.y,a.x); 
        vec2  o = vec2(m,1.0-m);
        vec2  b = a - o + K2;
        vec2  c = a - 1.0 + 2.0*K2;
        vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
        vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
        return dot( n, vec3(70.0) );
    }

    const mat2 m2 = mat2(1.6,  1.2, -1.2,  1.6);

    float fbm(vec2 p) {
        float amp = 0.5;
        float h = 0.0;
        for (int i = 0; i < 8; i++) {
            float n = noise(p);
            h += amp * n;
            amp *= 0.5;
            p = m2 * p ;
        }
        
        return  0.5 + 0.5*h;
    }
    vec3 smokeEffect(vec2 uv) {
        vec3 col = vec3(0.0);
        // time scale
        float v = 0.0002;
        vec3 smoke = vec3(1.0);
        vec2 scale = uv * 0.5 ;
        vec2 turbulence = TURBULENCE * vec2(noise(vec2(uv.x * 3.5, uv.y * 3.2)), noise(vec2(uv.x * 2.2, uv.y * 1.5)));
        scale += turbulence;
        float n1 = fbm(vec2(scale.x - abs(sin(u_time * v * 2.0)), scale.y - 50.0 * abs(sin(u_time * v))));
        col =  mix( col, smoke, smoothstep(0.5, 0.9, n1));
        col = clamp(col, vec3(0.0), vec3(1.0));
        return col;
    }

    float circle(vec2 p, float r) {
        float c = length(p) - r;
        return smoothstep(r + 0.01, r, c);
    }

    float sinwave(vec2 p, float scale, float amp) {
        float wave = cos(p.x * scale + 0.5) + 0.25 * cos(p.x * scale * scale);
        float s = smoothstep(amp + 0.01, amp, amp * wave - p.y);
        return s;
    }

    void main() {
        vec2 uv = v_texCoord;
        vec2 p = v_fragPos.xy;

        vec3 col = vec3(0.0);    
        vec3 smoke = smokeEffect(p);
        vec3 tex = texture(u_sample, uv).rgb;
        
        vec3 background = 0.7 * vec3(238.0,232.0,170.0)/255.0;
        vec3 mountCol = mix(vec3(102.0,153.0,153.0)/255.0, vec3(153.0,204.0,0.0)/255.0, p.y + 0.5);
        vec3 sunCol = 0.85 * mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), p.y + 0.5);
        vec3 cloudCol = vec3(0.9);
        float t = u_time * 0.05;
        vec2 sunPos = p - vec2(0.4 * cos(t), 0.4 * sin(t));
        float sun = circle(sunPos, 0.1); 
        float mountain1 = sinwave(p - vec2(0.5, -0.1), 3.0, 0.1);
        float mountain2 = sinwave(p, 3.0, 0.2);
        float cloud = 1.0 - smoke.r;
        col = mix(background, sunCol, sun);
        col = mix(mountCol * 0.9, col, mountain1);
        col = mix(cloudCol, col, cloud);
        col = mix(mountCol, col, mountain2);
        
        col *= 0.2 + 0.8 * pow(32.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.2);
        outColor = vec4(col ,1.0);
    }
`;
  
export default {
    vertex,
    fragment
}