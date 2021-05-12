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

    uniform vec2 u_mouse;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform sampler2D u_sample;
    
    in vec2 v_texCoord;
    in vec3 v_normal;
    in vec4 v_fragPos;
    out vec4 fragColor;

    // Convert to shadertoy namings
    #define iMouse u_mouse
    #define iResolution u_resolution
    #define iTime u_time

    #define PI 3.1416
    #define MAX_STEP 80
    #define EPSILON 0.01
    #define SUN_DIR vec3(-1.0,0.0,-2.0)
    #define SUN_COLOR vec3(0.7,0.4,0.3)
    #define SUN_GLOW vec3(0.7,0.5,0.5)
    #define SKY_COLOR vec3(0.7,0.8,0.9)
    #define CLOUD_SHADOW vec3(0.5,0.2,0.2)
    #define CLOUD_COLOR vec3(1.0)

    float hash1(in vec2 uv) {
        return 2.0*texture(u_sample, uv/64.0).r - 1.0;
    }

    float smoothNoise(in vec3 p) {
        vec2 luv = fract(p.xz); //range from 0.0 to 1.0
        vec2 id = floor(p.xz); //the integer part of uv, 0, 1, 2
        luv = luv*luv*(3.0 - 2.0*luv); //similar to smoothstep
        
        //get values from the cordinates of a square
        float bl = hash1(id);
        float br = hash1(id + vec2(1.0, 0.0));
        float tl = hash1(id + vec2(0.0, 1.0));
        float tr = hash1(id + vec2(1.0, 1.0));
        
        float b = mix(bl, br, luv.x); //interpolate between bl and br
        float t = mix(tl, tr, luv.x); //interpolate between tl and tr
        
        return mix(b, t, luv.y);
    }

    vec3 rotZ(in float rad, in vec3 pos)
    {
        mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
        pos.xy = rot*pos.xy;
        return pos;
    }

    vec3 path(in vec3 pos)
    {
        float a = sin(iTime*0.2)*0.12*PI;
        pos = rotZ(a, pos);
        return pos;
    }

    mat3 getCamera( in vec3 ta, in vec3 ro )
    {
        vec3 ww = normalize(ta-ro);
        vec3 up = vec3(0.0,1.0,0.0);
        up = path(up);
        vec3 uu = normalize(cross(ww, up));
        vec3 vv = normalize(cross(uu,ww));
        return mat3(uu,vv,ww);
    }

    mat2 m2 = mat2(0.8, 0.6, -0.6, 0.8);
    float map4(in vec3 p)
    {
        float scale = 0.8;
        p *= scale;
        vec3 q = p - vec3(0.0,0.1,1.0)*iTime;
        float f = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++)
        {
            f += amp*smoothNoise( q );
            q.xz = m2*q.xz;
            q *= 2.02;
            amp *= 0.5;
        }
        return 2.2 * f;
    }

    float cloudIntersect(in vec3 p) {
        float f = map4(p);
        return f - p.y;
    }

    vec4 raymarch( in vec3 ro, in vec3 rd, in vec3 bgcol )
    {
        vec4 sum = vec4(0.0);
        float t = 0.0;
        
        /*from iq's clouds: https://www.shadertoy.com/view/XslGRr*/
        for(int i=0; i<MAX_STEP; i++) 
        { 
            vec3  pos = ro + t*rd; 
            float den = cloudIntersect( pos ); 
            
            //early quit for better performance, some treaks on pos.y range
            if ( pos.y < -2.0 || pos.y > 3.5 || sum.a > 0.99) break; 
            
            if (den > EPSILON)
            {
                //base color
                vec4 col = vec4( mix( CLOUD_COLOR, CLOUD_SHADOW, den ), den );
                
                //brighter towards the sun
                float dif =  clamp((den - cloudIntersect(pos+0.5*normalize(SUN_DIR))), 0.0, 1.0 ); 
                vec3 lin = SUN_COLOR*dif;   
                col.xyz += lin;
                
                //mix with background according to distance
                col.xyz = mix( bgcol, col.xyz, exp(-0.01*t*t) );
                
                // front to back blending    
                col.a *= 0.5;
                col.rgb *= col.a;
                sum += col*(1.0-sum.a); 
            }
            t += max(0.08,0.03*t); 
        } 
        return sum;
    }

    vec3 render( in vec2 fragCoord )
    {
        vec3 col = vec3(0.0);
        vec2 uv = v_texCoord;
        uv.x *= iResolution.x/iResolution.y;
        uv = 2.0 * uv - 1.0;
        
        vec2 mouse = iMouse.xy;
        
        //vec3 ro = vec3(2.0*sin(mouse.x*6.28),mouse.y+0.1,2.0*cos(mouse.x*6.28));
        //vec3 ta = vec3(0.0,0.2,0.0);
        
        vec3 ro = vec3(0.0, 0.4, 0.0);
        vec3 ta = ro + vec3(0.0, -0.1, -1.0);
        
        mat3 cam = getCamera(ta,ro);
        vec3 rd = normalize(cam*(vec3(uv,1.0)));
        
        vec3 sunDir = normalize(SUN_DIR);
        float sun = max(dot(sunDir, rd),0.0);
        vec3 skyCol = vec3(0.0);
        
        skyCol += mix(SUN_GLOW, SKY_COLOR, 2.0*abs(rd.y));//horizontal brightness
        skyCol += 0.3*SUN_COLOR*pow(sun, 64.0);
        skyCol += 0.5*SUN_GLOW*pow(sun, 16.0);
        
        vec4 cloudCol = raymarch(ro, rd, skyCol);
        col = skyCol*(1.0-cloudCol.a) + cloudCol.xyz; 
        
        col += 0.7*SUN_GLOW*pow(sun, 8.0); //adding extra sun glow
        return col;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec3 col = render(fragCoord);
        col = pow( col, vec3(1.0/2.2));
        // vignetting        
        vec2 q = v_texCoord;
        col *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.65);
        
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