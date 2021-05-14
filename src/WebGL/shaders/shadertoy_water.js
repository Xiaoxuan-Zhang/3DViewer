import vertex from "src/WebGL/shaders/shadertoy_vertex.js";

var fragment = `#version 300 es
    precision mediump float;

    uniform vec2 u_mouse;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform sampler2D u_sample;
    uniform sampler2D u_sample1;
    
    in vec2 v_texCoord;
    in vec3 v_normal;
    in vec4 v_fragPos;
    out vec4 fragColor;

    // Convert to shadertoy namings
    #define iMouse u_mouse
    #define iResolution u_resolution
    #define iTime u_time

    #define EPSILON 0.0001
    #define SUN_COLOR vec3(1.2, 1.1, 0.8) 
    #define SUN_POS vec3(500.0, 160.0, 400.0)
    #define SUN_DIR vec3(0.0,0.8,0.0)
    #define SUN_GLOW vec3(1.2,0.6,0.3)
    #define SKY_COLOR vec3(0.5,0.7,1.0)
    #define OCEAN_COLOR vec3(0.04, 0.2, 0.6)
    #define CLOUD_COLOR vec3(1.0)
    #define MAX_STEP 60
    #define MAX_DIST 30.0
    #define AA 1

    float noise(in vec2 uv) {
        return texture(u_sample, uv/64.0).r;
    }

    float smoothNoise(in vec2 uv) {
        vec2 luv = fract(uv); //range from 0.0 to 1.0
        vec2 id = floor(uv); //the integer part of uv, 0, 1, 2
        luv = luv*luv*(3.0 - 2.0*luv); //similar to smoothstep
        
        //get values from the cordinates of a square
        float bl = noise(id);
        float br = noise(id + vec2(1.0, 0.0));
        float tl = noise(id + vec2(0.0, 1.0));
        float tr = noise(id + vec2(1.0, 1.0));
        
        float b = mix(bl, br, luv.x); //interpolate between bl and br
        float t = mix(tl, tr, luv.x); //interpolate between tl and tr
        
        return mix(b, t, luv.y);
    }

    float fbm4(in vec2 uv) {
        float amp = 0.5;
        float f = 2.0;
        float h = 0.0;
        float a = 0.0;
        for (int i = 0; i < 4; i++){
            h += amp * smoothNoise(uv*f);
            a += amp;
            amp *= 0.5;
            f *= 2.0;
        }
        
        h /= a;
        return h;
    }

    float smoothUnion( float d1, float d2, float k ) 
    {
        float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
        return mix( d2, d1, h ) - k*h*(1.0-h); 
    }

    float displacement (vec3 p) 
    {
        return sin(-p.y*0.8);
    }

    float sphereSDF(vec3 p, float r) {
        return length(p) - r;
    }

    const vec3 SCALE = vec3(18.0, 12.0, 15.0);
    vec4 stuff(vec3 p) {
        float t = sin(iTime*0.5 + p.x * 0.22 + p.z * 0.13 + p.y * 0.15);
        p = p - vec3(6.0, 0.8+t*t, 6.0);
        //vec3 q = p - SCALE * clamp(round(p/SCALE), vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
        //vec2 id = vec2(floor(q.x/5.0 - 2.5),floor(q.z/5.0 - 2.5));
        //float fid = id.x*13.3 + id.y*5.7;
        //float wr = 1.2+0.5*sin(fid);
        
        float wr = 1.2;
        float d = sphereSDF(p, wr) + displacement(p);
        d *= 0.5;
        return vec4(d, 3.0, 0.0, 1.0);
    }

    vec4 sdUnion(vec4 d1, vec4 d2)
    {
        return (d1.x<d2.x)? d1:d2;
    }

    float wave(in vec3 p) 
    {
        float t = iTime * 0.5;
        float hi = 0.0;
        hi += 0.15*smoothNoise(vec2(p.x*3.0 + t, p.z*2.5 + t));
        hi += 0.13*smoothNoise(vec2(p.x*2.2 - 1.5*t, 0.0));
        hi += 0.11*smoothNoise(vec2(p.x*2.2 - t, p.z*3.2 - t));
        return hi;
    }

    vec4 water(in vec3 p, float h) {
        
        float hi = wave(p);
        h += 0.15*hi;
        float d = p.y - h;
        return vec4(d, 1.0, 1.0, 0.0);
    }

    vec2 rot2D(in vec2 xy, float d)
    {
        float c = cos(d);
        float s = sin(d);
        return vec2(xy.x * c - xy.y * s, xy.x * s + xy.y * c);
    }

    vec4 land(in vec3 p, float h) {
        float hi = 0.0;
        float wave = 0.8*sin(-p.x*0.1) + 0.8*sin(-p.z*0.17);
        
        vec2 xy = rot2D(p.xz, -0.8); 
        //hi += 0.005*smoothNoise(vec2(xy.x*17.37, xy.y*5.5)); //a bit of a sand pattern
        
        h += wave ;
        h += hi;
        h -= 0.008*texture(u_sample1, p.xz*0.7).r; 
        float d = p.y - h;
        return vec4(d, 2.0, 0.0, 0.0);
    }

    vec4 map(in vec3 p) {
        vec4 res = vec4(0.0); //distance, material, reflect, refract
        //p.z -= 1.5;
        vec4 d0 = land(p, -0.5);
        vec4 d1 = stuff(p);
        vec4 d2 = water(p, -0.4);
        res = sdUnion(d0, d1);
        res = sdUnion(res, d2); 
        
        return res;
    }

    float castRayB(in vec3 ro, in vec3 rd) {
    float t = 0.01;
    for ( int i = 0; i < 30; ++i )
    {
        vec3 pos = ro + t * rd;
        vec4 h = stuff( pos );
        if ( h.x < EPSILON) return t;
        t += h.x;
        if (t > MAX_DIST) return MAX_DIST;
    } 
    return MAX_DIST;
    }

    vec4 castRay(in vec3 ro, in vec3 rd)
    {
    float t = 0.01;
    vec3 m = vec3(0.0);
    float tMax = MAX_DIST;

    for ( int i = 0; i < MAX_STEP; ++i )
    {
        vec3 pos = ro + t * rd;
        vec4 h = map( pos );
        m = h.yzw;
        if ( h.x < EPSILON * t ||  t > tMax)
        {
            break;
        }
        t += h.x;
    } 
        
    if ( t>tMax )
    {
        m = vec3(-1.0);
    }
    return vec4(t,m);
    }

    vec3 getNormal(vec3 p) {
        return normalize(vec3(
            map(vec3(p.x + EPSILON, p.y, p.z)).x - map(vec3(p.x - EPSILON, p.y, p.z)).x,
            map(vec3(p.x, p.y + EPSILON, p.z)).x - map(vec3(p.x, p.y - EPSILON, p.z)).x,
            map(vec3(p.x, p.y, p.z + EPSILON)).x - map(vec3(p.x, p.y, p.z - EPSILON)).x
        ));
    }


    vec3 sky2D(vec3 skyColor, vec3 cloudColor, vec2 uv) {
        vec3 col = vec3(0.0);
        float t = iTime * 0.1;
        float n1 = fbm4(vec2(uv.x + t, uv.y - t));
        col = mix( skyColor, cloudColor, smoothstep(0.2, 0.8, n1));
        return col;
    }

    float calcOcclusion( in vec3 pos, in vec3 nor)
    {
        float occ = 0.0;
        float sca = 1.0;
        for( int i=0; i<4; i++ )
        {
            float h = 0.01 + 0.16*float(i)/4.0;
            vec3 opos = pos + h*nor;
            float d = map( opos ).x;
            occ += (h-d)*sca;
            sca *= 0.8;
        }
        return clamp( 1.0 - 2.0*occ, 0.0, 1.0 );
    }

    vec3 calcSky(vec3 ro, vec3 rd) {
        //from IQ.
        const float SC = 1e5;
        //Trace out to a distant XZ plane.
        float dist = (SC - ro.y)/rd.y; 
        vec2 p = (ro + dist*rd).xz;
        
        vec3 sunDir = normalize(SUN_POS - ro);
        float sun = max(dot(sunDir, rd), 0.0);
        float core = smoothstep(0.98, 1.0, sun);
        
        vec3 skyCol = vec3(0.0);
        vec3 cloudCol = CLOUD_COLOR;
        
        
        skyCol += 0.5*SUN_COLOR*pow(core, 64.0);
        skyCol += 0.8*SUN_GLOW*pow(sun, 32.0);
        skyCol += mix(SUN_GLOW, SKY_COLOR, 2.0*abs(rd.y));//horizontal brightness
        
        skyCol = sky2D(skyCol, cloudCol, p*1.2/SC);
        float grad = smoothstep(0.0, 0.1, rd.y);
        skyCol = mix(SUN_GLOW, skyCol, grad);
        return skyCol;
    }

    vec3 calcLighting(in vec3 ro, in vec3 rd, in vec4 hit) {
        vec3 outCol = vec3(0.0);
        vec3 hitPoint = ro + hit.x * rd;
        vec3 sunDir = normalize(SUN_POS - ro);
        vec3 nor = getNormal(hitPoint);
        
        // draw water color 
        vec3 waterCol = vec3(0.0);
        
        // water reflection
        vec3 refDir = normalize(reflect(rd, nor));
        vec3 reflectCol = calcSky(hitPoint, refDir);
        
        // water specular
        vec3 H = normalize(sunDir - rd);
        float RN = max(dot(H, nor), 0.0);
        float spec = 0.8*pow(RN, 32.0);
        vec3 specCol = (SUN_COLOR + SUN_GLOW) * spec; 
        
        // water flare 
        float rnd = 2.0*noise(vec2(hitPoint.x * 3.4738, hitPoint.z * 7.7319));
        rnd *= 1.0-exp(-0.2*hit.x);
        specCol +=  rnd * spec;
        
        // water diffuse 
        float diff = max(dot(sunDir, nor), 0.0); 
        vec3 diffCol = SUN_COLOR  * OCEAN_COLOR;
        
        // fresnel
        float fresnel = 1.0 - max(dot(nor,-rd),0.0);
        fresnel = pow(fresnel,3.0);
        waterCol = mix(diffCol, specCol + reflectCol, fresnel); 
        
        // land
        vec3 landDiff = SUN_GLOW * diff;
        
        //refract 
        float refractRatio = 0.75;
        vec3 refractDir = normalize(refract(rd, nor, refractRatio));
        vec3 refractCol = calcSky(hitPoint, refractDir);
        
        //reflect
        float t = castRayB(hitPoint, refDir);
        if (t < MAX_DIST) {
            waterCol *= vec3(1.0, 0.92, 0.92); //fake reflection
        }
        
        
        if (hit.y == 1.0) {
            outCol = waterCol;
        } else {
            // wet area
            float w0 = smoothstep(-0.3, -0.15-0.1*rnd, hitPoint.y);
            outCol = mix(landDiff*0.5, landDiff, w0);

            float w1 = smoothstep(-0.4, -0.2, hitPoint.y);
            outCol = mix(waterCol, outCol, w1);
        }  
        
        outCol = mix(outCol, refractCol , hit.w);
        return outCol;
    }

    mat3 getCamera( in vec3 ro, in vec3 ta, float cr )
    {
        vec3 cw = normalize(ta-ro);
        vec3 cp = vec3(sin(cr), cos(cr), 0.0);
        vec3 cu = normalize( cross(cw,cp) );
        vec3 cv =          ( cross(cu,cw) );
        return mat3( cu, cv, cw );
    }

    vec3 render(in vec2 fragCoord) {
        vec2 uv = fragCoord.xy/iResolution.xy;
        uv -= 0.5; // translate to the center of the screen
        uv.x *= iResolution.x / iResolution.y; // restore aspect ratio
        vec2 mouse = iMouse.xy/iResolution.xy;
        mouse.y -= 0.5;
        
        //define camera
        float t = iTime * 0.1;
        vec3 ro = vec3(0.0, 0.0, 0.0);
        vec3 ta = vec3(cos(mouse.x * 6.28 + t), mouse.y*3.0, sin(mouse.x * 6.28 + t));
        mat3 cam = getCamera(ro, ta, 0.0);
        vec3 rd = normalize(cam * vec3(uv, 1.0));
        rd = normalize(rd);
        vec3 bgCol = calcSky(ro, rd);
        vec3 outCol = vec3(0.0);
        outCol = bgCol;
        
        vec4 hit = castRay(ro, rd);
        vec3 pos = ro + hit.x * rd;
        vec3 nor = getNormal(pos);
        
        if (hit.x < MAX_DIST) {
            outCol = calcLighting(ro, rd, hit);
            // fog
            outCol = mix( outCol, SUN_GLOW, 1.0 - exp( -0.008 * hit.x * hit.x ) );
        }
        return outCol;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec3 pixCol = vec3(0.0);
        vec2 offset = vec2(0.0);
        
    #if AA>1
        for (float y = 0.0; y < float(AA); ++y)
        {
            for (float x = 0.0; x < float(AA); ++x)
            {
                offset = -0.5 + vec2(x, y) / float(AA);

                pixCol += render(fragCoord+offset);
            }
        }
        pixCol /= float(AA*AA);
    #else
        pixCol += render(fragCoord);
    #endif
        
        // tone mapping
        //float exposure = 1.0;
        //pixCol = 1.0 - exp(-pixCol * exposure);
        
        // gamma
        pixCol = pow( pixCol, vec3(0.4546));
        
        // vignetting        
        vec2 q = v_texCoord;
        pixCol *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.3);
        fragColor = vec4(pixCol, 1.0);
        
    }

    void main() {
        mainImage(fragColor, gl_FragCoord.xy);
    }
`;
  
export default {
    vertex,
    fragment
}