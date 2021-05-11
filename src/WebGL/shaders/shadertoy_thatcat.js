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

#define PI 3.1416
#define TERRAIN_PATTERN 4.0*sin(12.0*pos.x)+sin(20.0*pos.y)+sin(15.0*pos.z)
#define SPEED aTime*0.3
#define MAX_DIST 20.0
#define MAX_STEP 80
#define SUN_DIRECTION vec3(0.8,0.3,0.9)
#define SUNLIGHT_INTENSITY vec3(6.0,5.5,4.0)
#define SUNSET_COLOR vec3(0.7,0.2,0.1)
#define SKY_COLOR vec3(0.25, 0.35, 0.6)
#define TERRAIN_COLOR vec3(0.07,0.04,0.03)
#define RIM_COLOR vec3(0.85,0.1,0.1)
#define RIM_POWER 0.15
#define AA_SIZE 1
#define iTime u_time
#define iResolution u_resolution

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

float sdSphere(in vec3 pos, in float r)
{
    return length(pos)-r;
}

//http://iquilezles.org/www/articles/ellipsoids/ellipsoids.htm
float sdElipsoid(in vec3 pos, in vec3 r)
{
    float k0 = length(pos/r);
    float k1 = length(pos/r/r);
    return k0*(k0-1.0)/k1;
}

float sdStick(vec3 p, vec3 a, vec3 b, float r1, float r2) // approximated
{
    vec3 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    float r = mix(r1, r2, h);
	return length( pa - ba*h ) - r;
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

//http://iquilezles.org/www/articles/smin/smin.htm
float smin(in float a, in float b, in float k)
{
    float h = max( k - abs(a-b), 0.0);
    return min(a,b) - h*h*0.25/k;
}

float smax(in float a, in float b, in float k)
{
    float h = max( k - abs(a-b), 0.0);
    return max(a,b) + h*h*0.25/k;
}

vec4 sdUnion(vec4 d1, vec4 d2)
{
    return (d1.x<d2.x)? d1:d2;
}

vec4 map(in vec3 pos, float aTime)
{
    vec4 res = vec4(0.0, 0.0, 0.0, 0.0);
    float t = fract(aTime);
    float y = 3.0*t*(1.0-t); 
    vec3 cen = vec3(0.0,0.25+0.01*y,SPEED);
    float sy = 0.8 + 0.2*y;
    float sz = 1.0/sy;
    vec3 r = vec3(0.35,0.32+0.02*sy,0.25+0.05*sz);
    vec3 q = pos-cen;
    vec3 h = q;
    
    //body
    float d = sdElipsoid(q-vec3(0.0, 0.03, -0.09), r);
    
  
    {
    
    //head
    float hr = sin(aTime);
    hr = 0.5*sign(hr)*smoothstep(0.5,1.0,abs(hr));
    h.xz = mat2(cos(hr),sin(hr),-sin(hr),cos(hr))*h.xz;
    
    float d1 = sdElipsoid(h - vec3(0.0, 0.32, 0.01), vec3(0.28, 0.2, 0.18));
    float d2 = sdElipsoid(h - vec3(0.0, 0.30, -0.07), vec3(0.2));
    d2 = smin(d1, d2, 0.08);
    d = smin(d, d2, 0.08);
    
    
    vec3 sh = vec3(abs(h.x), h.yz);//symmetric along x
    
    //legs
    vec3 shh = vec3(abs(h.x), h.y, abs(h.z+0.1));//symmetric along x and z
    //animation settings
    float t1 = fract(aTime+4.71*sign(h.x));
    float y1 = 3.0*t1*(1.0-t1); 
    float offset = y1;
    
    d1 = sdStick(shh - vec3(0.11,-0.24,0.22), vec3(0.0,0.18,-0.1), vec3(0.0,-0.1,-0.15*offset), 0.08, 0.05); 
    d = smin(d, d1, 0.04);
        
    //nose
    d1 = sdStick(h, vec3(0.0,0.41,0.12), vec3(0.0,0.37,0.18), 0.05, 0.03);
    d = smin(d,d1,0.01);
    
    //ears
    d2 = sdElipsoid(sh - vec3(0.15, 0.47, -0.05), vec3(0.06, 0.09, 0.04));
    d = smin(d, d2, 0.08);
    res = vec4(d,2.0,0.0,0.0);
    
    //tail
    d2 = sdStick(h, vec3(0.0,-0.3,-0.1), vec3(-0.1*y,0.2,-0.55), 0.03, 0.05);
    d = smin(d, d2, 0.06);
    res = vec4(d,2.0,0.0,0.0);
    
    
    //eyelids
    vec3 elPos = sh - vec3(0.04,0.33,0.09);
    d2 = sdStick(elPos, vec3(0.0,0.12,0.02), vec3(0.05,0.1,-0.02), 0.02, 0.02);
   	d = smin(d, d2, 0.03);
    res = vec4(d,2.0,0.0,0.0);
    
     
    //eyes
    float d5 = sdSphere(sh - vec3(0.065,0.4,0.108), 0.07);
    res = sdUnion(res, vec4(d5,3.0,0.0,0.0));
    
    float eyeOffsetY = 0.01*smoothstep(0.0, 0.8,sin(aTime));
    
    d5 = sdSphere(sh - vec3(0.066,0.40+eyeOffsetY,0.124), 0.056);
    res = sdUnion(res, vec4(d5,4.0,0.0,0.0));
         
    //mouth
    float d6 = sdElipsoid(h - vec3(0.0,0.29,0.16), vec3(0.06,0.03,0.04));
    float d7 = sdElipsoid(sh - vec3(0.035,0.32,0.175), vec3(0.055,0.036,0.04));
    d6 = smin(d6,d7,0.01);
    res = sdUnion(res, vec4(d6,6.0,0.0,0.0));
    
    //terrain
    float fh = -0.1+0.05*(sin(2.2*pos.x) + sin(1.5*pos.z));
    d1 = pos.y - fh;
    d1 -= .01*noise(vec2(pos.x*10.0,pos.z*10.0));
    if (d1<res.x) res = vec4(d1,1.0,0.0,0.0);
    
    //watermelon
    float b = 5.0;
    vec3 rep = vec3(mod(abs(pos.x),b)-3.5, pos.y, mod(abs(pos.z+1.5), b)-2.5);
    vec2 id = vec2(floor(abs(pos.x)/b),floor((pos.z+1.5)/b));
    float fid = id.x*13.3 + id.y*31.7;
    float wr = 1.4+0.5*sin(fid*1.312);
    
    d2 = sdSphere(rep, wr);
    if (d2<res.x) res = vec4(d2,8.0,0.0,0.0);
 
    }
    return res;
}

float calcOcclusion( in vec3 pos, in vec3 nor, in float aTime)
{
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<4; i++ )
    {
        float h = 0.01 + 0.16*float(i)/4.0;
        vec3 opos = pos + h*nor;
        float d = map( opos, aTime ).x;
        occ += (h-d)*sca;
        sca *= 0.95;
        
    }
    return clamp( 1.0 - 2.0*occ, 0.0, 1.0 );
}

vec3 calcNormal(in vec3 pos, in float aTime)
{
    vec2 e = vec2(0.001,0.0);
    return normalize( vec3(map(pos + e.xyy,aTime).x - map(pos - e.xyy,aTime).x,
                          map(pos + e.yxy,aTime).x - map(pos - e.yxy,aTime).x,
                          map(pos + e.yyx,aTime).x - map(pos - e.yyx,aTime).x) );
}

float castShadow(in vec3 ro, in vec3 rd, in float aTime)
{
    float res = 1.0;
    float t = 0.01;
    float tMax = MAX_DIST;

    for (int i=0; i<MAX_STEP;++i)
    {
        vec3 pos = ro + t*rd;
        float h = map(pos,aTime).x;
        res = min( res, 18.0*h/t );
        if (res<0.001) break;
        t += h;
        if (t>tMax) break;
    }
    return clamp(res, 0.0, 1.0);
}

vec4 castRay(in vec3 ro, in vec3 rd, in float aTime)
{
   float t = 0.01;
   vec3 m = vec3(0.0);
   float tMax = MAX_DIST;
   /*
   float hMax = 2.5;
   float bt = (hMax-ro.y)/rd.y;
   if ( bt>0.0 ) tMax = min(tMax, bt);
   */
   
   for ( int i = 0; i < MAX_STEP; ++i )
   {
       vec3 pos = ro + t*rd;
       vec4 h = map( pos,aTime );
       m = h.yzw;
       if ( abs(h.x)<(0.001*t) )
       {
           break;
       }
       t += h.x;
       if ( t>tMax ) break;
   } 
    
   if ( t>tMax )
   {
       m = vec3(-1.0);
   }
   return vec4(t,m);
}

vec3 render(in vec2 fragCoord, in float aTime)
{
    vec2 p = (2.0*fragCoord.xy - iResolution.xy)/iResolution.y;
    vec2 mouse = u_mouse;
    float angle = 10.0*u_mouse.x+1.0;
    
    vec3 ta = vec3(0.0,0.45,0.8+SPEED);
    vec3 ro = ta+vec3( 1.0*cos(angle), mouse.y, 1.0*sin(angle) );;
    
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize( cross( ww, vec3(0.0, 1.0, 0.0) ) );
    vec3 vv = normalize( cross( uu, ww ) );
    
    
    vec3 rd = normalize(p.x * uu + p.y * vv + 2.0*ww);
    vec3 sunDir = SUN_DIRECTION;//normalize( vec3(0.8,0.4,0.9) );
    
    vec3 col = SKY_COLOR - 0.8*rd.y;
    
    vec2 uv = rd.xz/rd.y; //sky dome( intersect the top )
    float sinV = 1.0*(sin(1.0*uv.x )+sin(1.0*uv.y))
        		+ 0.5*(sin(2.0*uv.x+aTime)+sin(2.0*uv.y+aTime));
    col = mix( col, vec3(0.9,0.85,0.6),smoothstep(-0.3,0.3,-0.5+sinV) );
    col = mix(col, SUNSET_COLOR, exp(-4.0*rd.y));
   
    vec4 tm = castRay(ro, rd, aTime);
    if ( tm.y>-1.0 )
    {
        float t = tm.x;
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal(pos, aTime);
        vec3 mate = vec3(0.18);
        if (tm.y==8.0)
        {
            //watermelon
            mate = vec3(0.03,0.1,0.07);
            float f = 1.0-smoothstep(-0.2, 0.2, TERRAIN_PATTERN);
            mate = mix(mate, vec3(0.0,0.05,0.03), f);
        } 
        else if (tm.y==7.0)
        {
            mate = vec3(0.8,0.2,0.0);
        }
        else if (tm.y==6.0)
        {
            mate = vec3(0.2,0.2,0.2); //mouth
        }
        else if (tm.y==5.0)
        {
            mate = vec3(0.25)*pos.y; //tail
        } 
        else if (tm.y==4.0)
        {
        	mate = vec3(0.01, 0.01, 0.015); //eyes 
        }
        else if (tm.y==3.0)
        {
            mate = vec3(0.5, 0.5, 0.5); //eyes
        }
        else if (tm.y==2.0)
        {
            mate = vec3(0.01,0.01,0.02);//body
        } else
        {
            mate = TERRAIN_COLOR;//terrain
        }
        
        float occ = calcOcclusion( pos, nor, aTime );
        float fresnel = clamp(1.0+dot(nor,rd),0.0,1.0);
        float sunDiff = clamp( dot(nor, sunDir),0.0,1.0 );
        float sunShadow = castShadow(pos+nor*0.01, sunDir, aTime);//step( castRay(pos+nor*0.001, sunDir).y,0.0 );
        float skyDiff = clamp( 0.5 + 0.5*dot(nor, vec3(0.0,1.0,0.0)),0.0,1.0 );
        //Simulate how lights bounce off from the ground to the object surface.
        float bounceDiff = clamp( 0.5 + 0.5*dot(nor, vec3(0.0,-1.0,0.0)),0.0,1.0 );
        col = mate*SUNLIGHT_INTENSITY*sunDiff*sunShadow;
        col += mate*SKY_COLOR*skyDiff;
        col += mate*SUNSET_COLOR*bounceDiff;
        col *= occ;
        col += RIM_POWER*RIM_COLOR*fresnel;
        
        if (tm.y==4.0 || tm.y==8.0)
        {
            vec3 viewDir = normalize(ro-pos);
            vec3 reflectDir = normalize(reflect(-sunDir, nor));
            float spec = pow(max(dot(reflectDir, viewDir), 0.0), 64.0);
            vec3 speCol = vec3(1.0) * spec;
            col += speCol;
        }
        
        // fog
        col = mix( col, SUNSET_COLOR, 1.0-exp( -0.005*t*t ) );
    } 
    return col;
}

void main() {
    vec3 col = vec3(0.0);
    vec2 off = vec2(0.0);
    vec3 noise = texture(u_sample, v_texCoord).rgb;
    
#if AA_SIZE>1
    //anti aliasing & motion blur
    for (float aaY = 0.0; aaY < float(AA_SIZE); ++aaY)
    {
        for (float aaX = 0.0; aaX < float(AA_SIZE); ++aaX)
        {
            off = -0.5+vec2(aaY,aaX)/float(AA_SIZE);
            
            float md = noise.x;
            float mb = (aaY*float(AA_SIZE)+aaX)/(float(AA_SIZE*AA_SIZE-1));
            mb += (md-0.5)/float(AA_SIZE*AA_SIZE);
            float aTime = iTime - mb*0.5*(1.0/24.0); //1 frame in 24fps for film
#else
            float aTime = iTime;
#endif
            
            col += render(v_fragPos.xy+off, aTime);
            
#if AA_SIZE>1
        }
    }
    col /= float(AA_SIZE*AA_SIZE);
#endif
    
    //gamma
    col = pow( col, vec3(0.4546));
    // vignetting        
    vec2 q = v_fragPos.xy;
    col *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.25);
    fragColor = vec4(col,0.0);
}
`;

export default {
    vertex,
    fragment
}