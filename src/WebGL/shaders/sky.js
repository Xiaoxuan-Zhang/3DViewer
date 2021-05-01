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
      v_fragPos = a_position;
      v_fragPos.z = 1.0; // force z to be 1.0 for later transformation
      v_normal = a_normal;
      v_texCoord = a_texCoord;
      gl_Position = a_position;
      gl_Position.z = gl_Position.w;
    }
    `;

var fragment =
    `#version 300 es
    #define SUN_COLOR vec3(0.6,0.5,0.2)
    #define SUN_GLOW vec3(0.7,0.4,0.4)
    #define SKY_COLOR vec3(0.5,0.6,0.9)
    #define SUN_DIR vec3(0.0, 0.5, -1.0)

    precision mediump float;
    uniform sampler2D u_noisemap;
    uniform float u_time;
    uniform mat4 u_viewProjectInvMatrix;
    in vec4 v_fragPos;
    out vec4 outColor;

    float noise(in vec2 uv) {
        return texture(u_noisemap, uv/64.0).r;
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

    vec3 calcSky(vec3 skyColor, vec3 cloudColor, vec2 uv) {
        vec3 col = vec3(0.0);
        // speed
        float v = 0.001;
        // layer1
        vec2 scale = uv * 2.0;
        vec2 turbulence = 0.008 * vec2(noise(vec2(uv.x * 10.0, uv.y *10.0)), noise(vec2(uv.x * 10.0, uv.y * 10.0)));
        scale += turbulence;
    	  float n1 = fbm4(uv);

        col = mix( skyColor, cloudColor, smoothstep(0.2, 0.8, n1));
        col = min(col, vec3(1.0));
        return col;
    }

    vec3 skybox() {
      vec4 t = u_viewProjectInvMatrix * v_fragPos;
      vec3 rd = normalize(t.xyz / t.w);
      // A simple way to place some clouds on a distant plane above the terrain -- Based on something IQ uses.
      const float SC = 1e5;
      // Trace out to a distant XZ plane.
      float dist = (SC - 0.0)/rd.y;
      vec2 p = (dist*rd).xz;

      vec3 sunDir = normalize(SUN_DIR);
      float sun = max(dot(sunDir, rd),0.0);
      vec3 skyCol = vec3(0.0);
      vec3 cloudCol = vec3(1.0);

      skyCol += mix(SUN_GLOW, SKY_COLOR, 2.0*abs(rd.y));//horizontal brightness
      skyCol += 0.5*SUN_COLOR*pow(sun, 64.0);
      skyCol += 0.4*SUN_GLOW*pow(sun, 32.0);

      skyCol = calcSky(skyCol, cloudCol, p/SC);
      float grad = smoothstep(0.0, 0.3, rd.y);
      skyCol = mix(SUN_GLOW*vec3(0.4,0.6,0.6), skyCol, grad);

      return skyCol;
    }

    void main(){
      outColor = vec4(skybox(), 1.0);
    }
    `;

export default {
    vertex,
    fragment
}
