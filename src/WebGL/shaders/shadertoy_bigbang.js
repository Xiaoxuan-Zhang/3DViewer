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

    const float EPSILON = 0.0001;
    const float PI = 3.1415926;
    const float MAX_DIST = 100.0;
    const int MAX_STEPS = 60;
    const vec3 LIGHTBLUE = vec3(154.0, 247.0, 247.0)/255.0;
    const vec3 GREEN = vec3(125.0, 245.0, 217.0)/255.0;
    const vec3 YELLOW = vec3(0.2, 0.2, 0.0);
    const vec3 PINK = vec3(255.0, 94.0, 186.0)/255.0;

    struct Material {
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
        float shiness;
    };

    #define BLINN 1
    #define AA 0

    float sphereSDF(vec3 p, float r) {
        return length(p) - r;
    }

    float sdTorus( vec3 p, vec2 t )
    {
        return length( vec2(length(p.xz)-t.x,p.y) )-t.y;
    }

    vec2 intersectSDF(vec2 dist0, vec2 dist1) {
        return dist0.x > dist1.x? dist0 : dist1;
    }

    vec2 unionSDF(vec2 dist0, vec2 dist1) {
        return dist0.x < dist1.x? dist0 : dist1;
    }

    vec2 diffSDF(vec2 dist0, vec2 dist1) {
        return dist0.x > -dist1.x? dist0 : vec2(-dist1.x, dist1.y);
    }

    vec3 rotX(vec3 p, float d) {
        mat4 rotM= mat4(1.0, 0.0, 0.0, 0.0, 
                        0.0, cos(d), -sin(d), 0.0, 
                        0.0, sin(d), cos(d), 0.0, 
                        0.0, 0.0, 0.0, 1.0);
        return vec3(rotM * vec4(p, 1.0));
    }
    vec3 rotY(vec3 p, float d) {
        mat4 rotM= mat4(cos(d), 0.0, sin(d), 0.0, 
                        0.0, 1.0, 0.0, 0.0,
                        -sin(d), 0.0, cos(d), 0.0, 
                        0.0, 0.0, 0.0, 1.0);
        return vec3(rotM * vec4(p, 1.0));
    }

    vec3 rotZ(vec3 p, float d) {
        mat4 rotM= mat4(cos(d), -sin(d), 0.0, 0.0, 
                        sin(d), cos(d), 0.0, 0.0, 
                        0.0, 0.0, 1.0, 0.0, 
                        0.0, 0.0, 0.0, 1.0);
        return vec3(rotM * vec4(p, 1.0));
    }

    vec3 doTranslate(vec3 p, vec3 t) {
        return p - t;
    }

    vec2 sceneSDF(vec3 p) {
        float deg = 90.0;
        float sr = 2.0;
        float lr = 2.0;
        float SR = 1.8;
        float LR = 1.5;
        float spheres[12];
        float vTime = iTime;
        
        float id = 1.0;
        for (int i = 0; i < 4; i ++) {
            float dx = SR * cos(90.0 * id * PI / 180.0);
            float dz = SR * sin(90.0 * id * PI / 180.0);
            vec3 v = vec3(p.x + dx, p.y, p.z + dz);
            spheres[i] = sphereSDF(v, sr);
            id += 1.0;
        }
        spheres[4] = sphereSDF(vec3(p.x, p.y + LR, p.z), lr);
        spheres[5] = sphereSDF(vec3(p.x, p.y - LR, p.z), lr);
        
        
        
        float torus[3];
        float t_ry = 0.1;
        float t_rxl = 16.0;
        float t_rxs = 12.0;
        float alpha0 = vTime;
        float alpha1 = vTime + 90.0 * PI / 180.0;
        torus[0] = sdTorus( rotX(p, alpha0), vec2(t_rxl, t_ry) );
        torus[1] = sdTorus( rotZ(p, alpha0), vec2(t_rxs, t_ry) );
        torus[2] = sdTorus( rotZ(p, alpha1), vec2(t_rxs, t_ry) );
        
        float ssr = 0.3;
        spheres[6] = sphereSDF(vec3(p.x, p.y - t_rxl * sin(alpha0), p.z + t_rxl * cos(alpha0)), ssr);
        spheres[7] = sphereSDF(vec3(p.x, p.y + t_rxl * sin(alpha0), p.z - t_rxl * cos(alpha0)), ssr);
        spheres[8] = sphereSDF(vec3(p.x - t_rxl, p.y, p.z), ssr);
        spheres[9] = sphereSDF(vec3(p.x + t_rxl, p.y, p.z), ssr);
        
        spheres[10] = sphereSDF(vec3(p.x - t_rxs * cos(alpha0), p.y - t_rxs* sin(alpha0), p.z), ssr);
        spheres[11] = sphereSDF(vec3(p.x - t_rxs * cos(alpha1), p.y - t_rxs* sin(alpha1), p.z), ssr);
        
        float objId = 0.0;
        //horizontal spheres
        vec2 combined = unionSDF(vec2(spheres[0], objId), vec2(spheres[1], objId));
        combined = unionSDF(combined, vec2(spheres[2], objId));
        combined = unionSDF(combined, vec2(spheres[3], objId));
        
        //lower sphere
        objId++;
        combined = unionSDF(combined, vec2(spheres[4], objId));
        
        //upper sphere
        objId++;
        combined = unionSDF(combined, vec2(spheres[5], objId));
        
        //small spheres
        objId++;
        combined = unionSDF(combined, vec2(spheres[6], objId));
        combined = unionSDF(combined, vec2(spheres[7], objId));
        combined = unionSDF(combined, vec2(spheres[8], objId));
        combined = unionSDF(combined, vec2(spheres[9], objId));
        combined = unionSDF(combined, vec2(spheres[10], objId));
        combined = unionSDF(combined, vec2(spheres[11], objId));
        
        //large tortus
        objId++;
        combined = unionSDF(combined, vec2(torus[0], objId));
        
        //small tortus
        objId++;
        combined = unionSDF(combined, vec2(torus[1], objId));
        combined = unionSDF(combined, vec2(torus[2], objId));
        
    
        
    return combined;
    }

    vec2 rayMarching(vec3 ro, vec3 rd) {
        float tmax = MAX_DIST;
        float t = 0.0;
        vec2 result = vec2(-1.0);
        
        for (int i = 0; i < MAX_STEPS; i++)
        {
            vec3 p = ro + rd * t;
            vec2 res = sceneSDF(p);
            if (res.x < EPSILON || t > tmax) break;
            result.x = t;
            result.y = res.y;
            t += res.x;
        }
        if (t > tmax) {
            result.x = tmax;
            result.y = -1.0;
        }
        return result;
    }

    const vec3 AMBIENT_COLOR = vec3(0.1);
    const vec3 DIFFUSE_COLOR = vec3(0.6);
    const vec3 SPEC_COLOR = vec3(0.5);
    const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 0.0);

    vec3 shading(vec3 normal, vec3 viewDir, vec3 lightDir, Material mat) {
        
        vec3 ambCol = AMBIENT_COLOR * mat.ambient;
        vec3 V = normalize(viewDir);
        vec3 L = normalize(lightDir);
        vec3 N = normalize(normal);
        float diff = max(dot(N, L), 0.0);
        vec3 diffCol = DIFFUSE_COLOR * diff * mat.diffuse;
        
        vec3 R = normalize(reflect(-L, N));  
        vec3 VR = normalize(reflect(-V, N)); 
        
    #if BLINN == 1
        vec3 H = normalize(L + V);
        float spec = pow(max(dot(N, H), 0.0), mat.shiness);
    #else    
        
        float spec = pow(max(dot(V, R), 0.0), mat.shiness);
    #endif   
        
        vec3 speCol = SPEC_COLOR * spec * mat.specular;
        
        vec3 refl = texture(u_cubemap, VR).rgb;
        
        return refl * mat.diffuse + speCol;
    }

    mat3 getCamera( in vec3 ro, in vec3 ta, float cr )
    {
        vec3 cw = normalize(ta-ro);
        vec3 cp = vec3(sin(cr), cos(cr),0.0);
        vec3 cu = normalize( cross(cw,cp) );
        vec3 cv =          ( cross(cu,cw) );
        return mat3( cu, cv, cw );
    }

    vec3 getNormals(vec3 p) {
        float x = sceneSDF(vec3(p.x + EPSILON, p.y, p.z)).x - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)).x;
        float y = sceneSDF(vec3(p.x, p.y + EPSILON, p.z)).x - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)).x;
        float z = sceneSDF(vec3(p.x, p.y, p.z + EPSILON)).x - sceneSDF(vec3(p.x, p.y, p.z - EPSILON)).x;
        return normalize(vec3(x, y, z));
    }

    vec3 background(vec2 p) {
        return mix(YELLOW, GREEN, p.y + 0.5);
    }

    vec3 render(in vec2 fragCoord) {
    vec2 uv = v_texCoord;
    uv -= 0.5;
    uv.x *= iResolution.x/iResolution.y;
    
    vec3 ro = vec3 (cos(iTime) * 10.0 + 10.0, 3.0, sin(iTime) * 10.0 + 20.0);
    //vec3 ro = vec3 (0.0, 5.0, 25.0);
    vec3 ta = vec3 (0.0, 0.0, -1.0);
    mat3 cam = getCamera(ro, ta, 0.0);
    
    vec3 rd = normalize(cam * vec3(uv, 1.0));
    vec2 h = rayMarching(ro, rd);
    
    vec3 col = vec3(0.0);
    
    if (h.x < MAX_DIST) {
        
        vec3 p = ro + rd * h.x;
        vec3 nor = getNormals(p);
        vec3 lightPos = vec3(20.0 * sin(iTime), 10.0, -20.0);
        vec3 lightDir = lightPos - p;
        vec3 viewDir = ro - p;
            
        Material mat;
        //chrome
        mat.ambient = vec3(0.25);
        mat.diffuse = vec3(0.5);
        mat.specular = vec3(0.674597);
        mat.shiness = 1.2;
        
        if (h.y == 1.0 || h.y == 2.0) {
            //pink
            mat.ambient = PINK;
            mat.diffuse = PINK;
            mat.specular = PINK;
        } else if (h.y == 0.0) {
            //gold
            mat.ambient = vec3(0.24725, 0.1995, 0.0745);
            mat.diffuse = vec3(0.75164, 0.60648, 0.12648);
            mat.specular = vec3(0.628281, 0.555802, 0.366065);
            mat.shiness = 1.2;
        } 
        col += shading(nor, viewDir, lightDir, mat) ;
    } else {
        col = background(uv);
    }
        return col;
    }

    void mainImage (out vec4 fragColor, in vec2 fragCoord)
    {
        vec3 col = vec3(0.0);
    #if AA > 1
        float count = 0.0;
        for (float aaY = 0.0; aaY < float(AA); aaY++)
        {
            for (float aaX = 0.0; aaX < float(AA); aaX++)
            {
                col += render(fragCoord + vec2(aaX, aaY) / float(AA));
                count += 1.0;
            }
        }
        col /= count;
    #else
        col += render(fragCoord);
    #endif
        
        col = pow( col, vec3(1.0/2.2) );
        
        
        vec2 p = v_texCoord;
        col *= 0.2 + 0.8 * pow(32.0 * p.x * p.y * (1.0 - p.x) * (1.0 - p.y), 0.2);
        
        fragColor = vec4 (col, 1.);
    }

    void main() {
        mainImage(fragColor, gl_FragCoord.xy);
    }
`;
  
export default {
    vertex,
    fragment
}