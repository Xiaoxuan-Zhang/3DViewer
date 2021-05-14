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

    #define PI 3.1415926
    #define EPSILON 0.001
    const int MAX_STEPS = 60;
    const float MAX_DISTANCE = 80.0;

    struct Ray {
        vec3 ro;
        vec3 rd;
    };

    struct Light {
        vec3 position;
        vec3 color;
    };
        
    Light lightInfo = Light(vec3(3.0, 10.0, 0.0), vec3(10.0));

    struct Material {
        vec3 albedo;
        float diffuse;
        float specular;
        float reflection;
        float refraction;
    };
        
    struct Hit {
        float dist;
        int matIndex; //material info at the intersection point
    };

    float planeSDF(vec3 p) {
        return p.y;
    }

    float sdPlane( vec3 p, vec4 n )
    {
    // n must be normalized
    return dot(p, n.xyz) + n.w;
    }

    float sphereSDF(vec3 p, float r) {
        return length(p) - r;
    }

    float sdBox( vec3 p, vec3 b )
    {
    vec3 d = abs(p) - b;
    return length(max(d,0.0))
            + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
    }

    Hit unionSDF(Hit d1, Hit d2) 
    {
        if (d1.dist < d2.dist) {
            return d1;
        } else {
            return d2;
        }  
    }

    vec3 doTranslate(vec3 p, vec3 offset) 
    {
        return p - offset;
    }

    vec3 rotX(vec3 p, float d) 
    {
        mat4 rotM= mat4(1.0, 0.0, 0.0, 0.0, 
                        0.0, cos(d), -sin(d), 0.0, 
                        0.0, sin(d), cos(d), 0.0, 
                        0.0, 0.0, 0.0, 1.0);
        return vec3(rotM * vec4(p, 1.0));
    }

    Hit sceneSDF(vec3 p) {
        Hit rst;
        vec3 p1 = doTranslate(p, vec3(6.0, 3.1, -3.0));
        Hit is0 = Hit(sphereSDF(p1, 3.0), 2);
        p1 = doTranslate(p, vec3(-2.0, 2.1, 8.0));
        Hit is1 = Hit(sphereSDF(p1, 2.0 ), 2);
        p1 = doTranslate(p, vec3(3.0, 1.5 + 10.0 * abs(sin(2.0*iTime)), 1.0));
        Hit is2 = Hit(sphereSDF(p1, 1.5 ), 1);
        
        /*
        Hit is3 = Hit(sdPlane(p, vec4(0.0, 1.0, 0.0, 0.0)), 0);
        Hit is4 = Hit(sdPlane( p, vec4(0.0, 0.0, 1.0, 20.0)), 0);
        Hit is5 = Hit(sdPlane( p, vec4(1.0, 0.0, 0.0, 20.0)), 0);
        Hit is6 = Hit(sdPlane( p, vec4(-1.0, 0.0, 0.0, 20.0)), 0);
        Hit is7 = Hit(sdPlane( p, vec4(0.0, 0.0, -1.0, 20.0)), 0);
        Hit is8 = Hit(sdPlane( p, vec4(0.0, -1.0, 0.0, 30.0)), 0);
        */
        
        Hit outerBox = Hit(sdBox(p-vec3(0.0,25.0,0.0), vec3(25.0,25.0,25.0)), 0); 
        outerBox.dist = -outerBox.dist;
        
        p1 = doTranslate(p, vec3(0.0, 3.5, -1.0));
        Hit is9 = Hit(sdBox( p1, vec3(1.0, 3.0, 4.0)), 3);
        
        rst = unionSDF(is0, is1);
        rst = unionSDF(rst, is2);
        rst = unionSDF(rst, outerBox);
        /*
        rst = unionSDF(rst, is3);
        rst = unionSDF(rst, is4);
        rst = unionSDF(rst, is5);
        rst = unionSDF(rst, is6);
        rst = unionSDF(rst, is7);
        rst = unionSDF(rst, is8);
        */
        rst = unionSDF(rst, is9);
        return rst;
    }

    vec3 getNormal(vec3 p) {
        return normalize(vec3(
            sceneSDF(vec3(p.x + EPSILON, p.y, p.z)).dist - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)).dist,
            sceneSDF(vec3(p.x, p.y + EPSILON, p.z)).dist - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)).dist,
            sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)).dist - sceneSDF(vec3(p.x, p.y, p.z - EPSILON)).dist
        ));
    }

    Hit marching(vec3 ro, vec3 rd, float signInd) 
    {
        float tmax = MAX_DISTANCE;
        float t = EPSILON;
        Hit result = Hit(-1.0, -1);
        
        for (int i = 0; i < MAX_STEPS; i++)
        {
            vec3 p = ro + rd * t;
            Hit res = sceneSDF(p); 
            float dist = res.dist * signInd;
            
            if (dist < 0.0 )
            {
                return result;
            }
            else if (t > tmax)
            {
                result.matIndex = -1;
                result.dist = tmax;
                break;
            }
            
            t += max(dist, EPSILON); //faster than abs()
            result.dist = t;
            result.matIndex = res.matIndex;
        }
        
        return result;
    }

    vec3 background(vec2 p) 
    {
        return vec3(0.0);//mix(vec3(0.2, 0.5, 0.5), vec3(0.4, 0.3, 0.3), pow(0.8, (p.y + 0.5) * 0.1));
    }

    vec3 getColor(vec3 ro, vec3 p, vec3 nor, int matIdx, in Material mat) {
        vec3 col = vec3(0.0);
        vec3 N = nor;
        vec3 V = normalize(ro - p);
        vec3 L = normalize(lightInfo.position - p);
        vec3 R = reflect(-L, N);
        float spec = pow(max(dot(V, R), 0.0), mat.specular);
        
        // floor
        if (matIdx < 1 && N.y > 0.5) {
            mat.albedo = mix(vec3(0.0), vec3(0.95), mod(floor(p.x * 0.3) + floor(p.z * 0.3), 2.0));
        } 
        vec3 ambient = vec3(0.1) * mat.albedo;
        col += ambient;
        
        col += float(matIdx) * spec * lightInfo.color; 
        
        return col;
    }

    mat3 getCamera( in vec3 ro, in vec3 ta) {
        vec3 cw = normalize(ta-ro);
        vec3 cp = vec3(0.0, 1.0, 0.0);
        vec3 cu = normalize( cross(cw,cp) );
        vec3 cv =          ( cross(cu,cw) );
        return mat3( cu, cv, cw );
    }

    //hacks for non-constant index expression
    Material getMaterial(int index) {
        Material mat[4];
        mat[0] = Material(vec3(0.6, 0.75, 0.8), 0.5, 16.0, 0.8, 0.0); 
        mat[1] = Material(vec3(1.0, 0.5, 0.5), 0.1, 128.0, 0.4, 0.9); 
        mat[2] = Material(vec3(0.1,0.1,0.2), 0.1, 128.0, 0.4, 0.9); 
        mat[3] = Material(vec3(0.2, 0.6, 0.6), 0.1, 128.0, 0.4, 0.9); 
        if (index == 0) {
            return mat[0];
        } else if (index == 1) {
            return mat[1];
        } else if (index == 2) {
            return mat[2];
        } else if (index == 3) {
            return mat[3];
        }
    }

    vec3 reflectionRay(in vec3 ori, in vec3 dir, in vec3 backColor, in vec3 pixColor, inout vec3 att) {
        for (float i = 0.0; i < 2.0; i++) {
            Hit icp = marching(ori, dir, 1.0);
            vec3 interP = ori + icp.dist * dir; 
            vec3 nor = getNormal(interP);
            Material mat = getMaterial(icp.matIndex);
            if (icp.matIndex < 0) {
                pixColor += vec3(0.0);//mix(pixColor, backColor, att);
            } else {
                vec3 localColor = getColor(ori, interP, nor, icp.matIndex, mat); 
                pixColor = mix(pixColor, localColor, att);
                dir = reflect(dir, nor);
                ori = interP + dir * EPSILON;
                att *= mat.reflection;
            }
        }
        return pixColor;
    }
    vec3 refractionRay(in vec3 ori, in vec3 dir, in vec3 backColor, in vec3 pixColor, in float refractionRatio, inout float signInd, inout vec3 att) {
        for (float i = 0.0; i < 4.0; i++) {
            Hit icp = marching(ori, dir, signInd);
            vec3 interP = ori + icp.dist * dir; 
            vec3 nor = signInd * getNormal(interP);
            Material mat = getMaterial(icp.matIndex);
            if (icp.matIndex < 0) {
                pixColor += vec3(0.0); //mix(pixColor, backColor, att);
            } else {
                if (signInd > 0.0) { 
                    vec3 localColor = getColor(ori, interP, nor, icp.matIndex, mat); 
                    pixColor = mix(pixColor, localColor, att);
                }
                
                vec3 refractDir = refract(dir, nor, refractionRatio);
                vec3 reflectDir = reflect(dir, nor);
                
                if (dot(refractDir, refractDir) < EPSILON ) {
                    //total internal reflection
                    dir = reflectDir;
                    ori = interP + dir * EPSILON;
                    att *= mat.reflection;
                } else {
                    //flip normal direction and refractionRatio for the next ray
                    dir = refractDir;
                    ori = interP + dir * EPSILON;
                    signInd = -signInd;
                    refractionRatio = 1.0/ refractionRatio;
                    att *= mat.refraction; 
                } 
            }
        }
        return pixColor;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
        vec2 uv = v_texCoord;
        uv -= 0.5; 
        uv.x *= iResolution.x/iResolution.y;  
    
        vec3 col = vec3(0.0);
        vec2 mouse = vec2(0.01) + iMouse.xy/iResolution.xy;
        mouse.x -= 0.5;
        float rot = mouse.x + iTime*0.05;
        vec3 ro = vec3(-20.0 * cos(rot * 2.0 * PI), 2.0+8.0 * mouse.y, -20.0 * sin(rot * 2.0 * PI));
        vec3 ta = vec3(0.0, 2.0, -2.0);
        mat3 cam = getCamera(ro, ta);
        vec3 rd = normalize(cam * vec3(uv, 1.0));
        
        vec3 nor = vec3(0.0);  
        vec3 ori = ro;
        vec3 dir = rd;
        vec3 interP = vec3(0.0);
        float signInd = 1.0;
        vec3 reflectDir = vec3(0.0);
        vec3 refractDir = vec3(0.0);
        float refractionRatio = 1.0/1.4;
        vec3 localColor = vec3(0.0);
        vec3 f0 = vec3(0.03);
        vec3 refractAtt = vec3(1.0);
        vec3 reflectAtt = vec3(1.0);
        vec3 refractCol = vec3(0.0);
        vec3 reflectCol = vec3(0.0);
        
        //initial ray
        Hit icp = marching(ori, dir, 1.0); //reserved for future use
        Hit initRay = icp;
        interP = ori + icp.dist * dir; 
        nor = signInd * getNormal(interP);
        Material mat = getMaterial(icp.matIndex);
        vec3 backColor = background((ori + MAX_DISTANCE * dir).xy);
        if (icp.matIndex < 0) {
            col += vec3(0.0);
        } else {
            col += getColor(ori, interP, nor, icp.matIndex, mat);
        }
        
        refractDir = refract(dir, nor, refractionRatio);
        reflectDir = reflect(dir, nor);
        
        //reflection ray
        dir = reflectDir;
        ori = interP + dir * EPSILON;
        reflectAtt *= mat.reflection;
        reflectCol = reflectionRay(ori, dir, backColor, col, reflectAtt);
        
        //refraction ray
        if (dot(refractDir, refractDir) < EPSILON ) {
            //total internal reflection
            dir = reflectDir;
            ori = interP + dir * EPSILON;
        } else {
            //flip normal direction and refractionRatio for the next ray
            dir = refractDir;
            ori = interP + dir * EPSILON;
            signInd = -signInd;
            refractionRatio = 1.0/refractionRatio;
        }
        refractAtt *= mat.refraction;
        refractCol = refractionRay(ori, dir, backColor, col, refractionRatio, signInd,refractAtt);
        
        col = reflectCol + refractCol;
        
        col = pow(col, vec3(1.0/2.2)); 
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