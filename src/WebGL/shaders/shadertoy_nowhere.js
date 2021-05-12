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
    out vec4 fragColor;

    #define iTime u_time
    #define iMouse u_mouse
    #define iResolution u_resolution

    /*
http://www.iquilezles.org/www/articles/terrainmarching/terrainmarching.htm
http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
*/

const vec3 PURPLE = vec3(1.0, 0.9, 1.0);//vec3(141.0, 0.0, 196.0)/255.0;
const vec3 PINK = vec3(0.5, 0.4, 0.4);//vec3(255.0,192.0,203.0)/255.0;
const vec3 WHITE = vec3(1.0);
const vec3 BLACK = vec3(0.0);
const vec3 SKY = vec3(0.0);
const vec3 MOON = vec3(1.0, 0.6, 0.0);
const vec3 BLUE = vec3(0.1,0.2,0.3);
const vec3 GREEN = vec3(0.1,0.2,0.3);
const vec3 EARTH = vec3(0.1);
const float PI = 3.1415926;
const float EPSILON = 0.0001;
const float SCALE = 0.01;
const float HEIGHT = 12.0;
const float MAX_DISTANCE = 400.0;
const int MAX_STEP = 40;
const int ITERATION = 8;
const float LUCUNARITY = 1.2;
#define AA 1

vec3 moonDir = normalize(vec3(7.0, 1.0, -5.0));

float hash1(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * 0.013);
    p3 += dot(p3, p3.yzx + 19.31);
    return -1.0 + 2.0 * fract((p3.x + p3.y) * p3.z);
}

float noise(in vec2 x) {
    vec2 p = floor(x);
    vec2 w = fract(x);
    
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    
    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));

    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;

    return k0 + k1*u.x + k2*u.y + k4*u.x*u.y;
}

vec3 noised( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec2 du = 30.0*w*w*(w*(w-2.0)+1.0);
    
    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));

    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;

    return vec3( -1.0 + 2.0 * (k0 + k1*u.x + k2*u.y + k4*u.x*u.y), 
                      2.0* du * vec2( k1 + k4*u.y,
                                      k2 + k4*u.x ) );
}

const mat2 m2 = mat2(1.2,  0.8, -0.8,  1.2);
float fbm4(vec2 p) {
    float amp = 1.0;
    float h = 0.0;
    for (int i = 0; i < ITERATION; i++) {
        float n = noise(p);
        h += amp * n;
        amp *= 0.5;
        p = m2 * p ;
    }
	return  h;
}


const mat2 m = mat2(1.2, -0.6, 0.6, 1.2);
vec4 fbmd4(vec2 v) {
    
    float amp = 1.0;
    float f = 1.0 ;
    float h = 0.0;
    vec2 d = vec2(0.0);
    for (int i = 0; i < ITERATION; i++) {
        vec3 n = 1.0 - abs(noised(v * SCALE * f)); //noised(v * SCALE * f)
        h += amp * n.x;
        d += amp * n.yz * f;
        amp *= 0.5;
        f *= LUCUNARITY;
        v = m * v;
    }
    h *= HEIGHT  ;
	d *= HEIGHT * SCALE;
	return vec4( h, normalize( vec3(-d.x,1.0,-d.y) ) );
}

vec4 terrainMap(vec3 v) {
    vec4 terrain = fbmd4(v.xz - vec2(100.0, 0.0));
    terrain.x += .02*noise(v.xz*0.8);
    return terrain;
}

    
vec4 sceneMap(vec3 v) {
    return terrainMap(v);
}

vec3 getNormal(vec3 p )
{
    vec2 OFFSET = vec2(EPSILON, 0.0);
    return normalize( vec3( sceneMap(p-OFFSET.xyy).x-sceneMap(p+OFFSET.xyy).x,
                            1.0*EPSILON,
                            sceneMap(p-OFFSET.yyx).x-sceneMap(p+OFFSET.yyx).x ) );
}
vec3 moon(vec3 ro, vec3 rd) {
    float n1 = 0.3*noise(rd.xy * 20.0 - iTime);
    float n2 = 0.3*noise(rd.xy * 10.0 - iTime);
    float sdot = dot(rd, moonDir)*10.0;
    float m1 = smoothstep(9.4, 9.75, sdot);
    float col1 = pow(m1, 128.0);
    float m2 = smoothstep(9.0+n1, 9.75, sdot);
    float col2 = pow(m2, 64.0);
    float m3 = smoothstep(8.2+n2, 9.7, sdot);
    float col3 = pow(m3, 32.0);
    float hole1 = (col2 -col1);
    float hole2 = (col3 -col1);
    vec3 rst = hole1*MOON*8.0 + hole2*BLUE*2.0;
    return rst;
}


vec3 stars(vec2 p) {
    float t = iTime * 0.1;
    float n1 = hash1(p*0.1) ;
    n1 *= pow(n1*n1, 680.0) ;
    n1 *= sin(t*5.0 + p.x + sin(t*2.0 + p.y));
    n1 = clamp(n1, 0.0, 1.0);
    return n1 * vec3(1.0);
}

vec3 sky(vec3 ro, vec3 rd) {
    vec3 col = vec3(0.0);
    vec3 v = ro + rd*MAX_DISTANCE;
    float n1 = noise(v.xy * 0.001);
    float n2 = noise(v.yx * 0.001);
    vec3 skyCol = GREEN * 0.01;
    col += mix(skyCol, GREEN, exp(-16.0*v.y/MAX_DISTANCE));
    col += stars(v.xy);
    col += moon(ro, rd);
    return col;
}

vec4 castRay(vec3 ro, vec3 rd) {
    vec4 re = vec4(-1.0);
    float t = 0.0;
    for( int i=0; i<MAX_STEP; i++ ){
        vec3 p = ro + rd * t;
        vec4 n = sceneMap(p);
        float h = p.y - n.x;
    	re = vec4(t, n.yzw);
        t += h*n.z; 
        if ((abs(h) < EPSILON) || t > MAX_DISTANCE) {
            break;
        } 
    }
    
    if (t > MAX_DISTANCE) {
        re = vec4(-1.0);
    }
    return re;
}

vec3 getShading(vec3 ro, vec3 rd, vec3 p, vec3 normal, vec3 color) {
    vec3 col = vec3(0.0);
    vec3 lightDir = moonDir;
    float moonAmount = max(dot(rd, lightDir), 0.0);
    vec3 lightCol = mix( GREEN, MOON, pow(moonAmount, 2.0));
    
    vec3 viewDir = normalize(ro - p); 
    vec3 refDir = reflect(-lightDir, normal);
    
    vec3 ambCol = lightCol * 0.1;
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffCol = lightCol * diff;
    
    float spec = pow(max(dot(refDir, viewDir), 0.0), 8.0);
    vec3 speCol = lightCol * spec * 0.7;
    
    
    
    col = (speCol + diffCol) * color ;
    return col;
}

vec3 getMaterial(vec3 ro, vec3 rd, vec3 p, vec3 normal) {
    //vec3 col = texture(iChannel1, p.xz * 0.0051, - 100.0).xyz * 0.5;
    vec3 col = vec3(0.3, 0.1, 0.1);
    vec3 lightDir = moonDir;
    //a bit of sprinkling
    if (hash1(p.xz) > 0.995) {
    	col += clamp(sin(iTime + p.x*p.z), 0.5, 1.0) * vec3(1.2);
  	}
    
    return col;
}

vec3 terrainColor(vec3 ro, vec3 rd, vec3 p, vec3 nor) {
    vec3 col = vec3(0.0);
    col = getMaterial(ro, rd, p, nor);
    col = getShading(ro, rd, p, nor, col) ;
    
    return col;
}

vec3 fog(vec3 ro, vec3 rd, vec3 p, vec3 pixCol, float dis)
{
    vec3 lightDir = moonDir;
    //base color and moonlight
    vec3 fogCol = vec3(0.0);
    float b  = 0.000005;
    float fogAmount = 1.0 - exp( -dis*dis*b );
    
    float moonAmount = max(dot(rd, lightDir), 0.0);
    vec3 mixFog = mix(GREEN, MOON*0.5, pow(moonAmount, 16.0));
	fogCol = mix( pixCol, mixFog, fogAmount );
   
    //adding density
    float c = 0.001;
    float b1 = 0.15;
    float t = iTime ;
    float v = 1.0;
    vec3  denCol  = GREEN; 
    float density =  c * exp(-ro.y*b1) * (1.0 - exp(-dis*rd.y*b1 ))/(rd.y);
    
    float turb = fbm4(vec2(p.x*0.02+t*v, p.z*0.02+t*v));
    density += 0.05*turb;
    fogCol += mix( pixCol, denCol, density);
    return fogCol;
}

mat3 getCamera( in vec3 ro, in vec3 ta, float cr )
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv =          ( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

vec3 render( in vec2 fragCoord)
{
    vec2 uv = -1.0 + 2.0 * fragCoord.xy/iResolution.xy ;
    //uv -= 0.5; // translate to the center of the screen
    uv.x *= iResolution.x / iResolution.y; // restore aspect ratio
    vec2 mouse = iMouse.xy;
    //define camera
    vec3 ro = vec3 (cos(mouse.x * 6.28) * 10.0, 0.0, sin(mouse.x * 6.28) * 10.0);
    vec3 ta = vec3 (0.0, 1.0, -2.0);
    mat3 cam = getCamera(ro, ta, 0.0);

    vec3 rd = normalize(cam * vec3(uv, 1.0));
    
    //draw scene
   	vec3 color = vec3(0.0);
    vec4 hnor = castRay(ro, rd);
    vec3 p = ro + rd * hnor.x;
    
    if (hnor.x > EPSILON) {
        //vec3 nor = hnor.yzw + 0.01*hash1(p.xz * 5.0);
        vec3 nor= getNormal(p) ;
        color += terrainColor(ro, rd, p, nor);  
        color = fog(ro, rd, p, color, hnor.x);
    } else {
        color += sky(ro, rd);
    }
    return color;
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
        
    pixCol = pow( pixCol, vec3(1.0/2.2) );
    
    // Output to screen
    fragColor = vec4(pixCol, 1.0);
	
}

void main() {
    vec3 tex = texture(u_sample, v_texCoord).rgb;
    mainImage(fragColor, gl_FragCoord.xy);
}
`;
  
export default {
    vertex,
    fragment
}