import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import finalPassShader from "src/WebGL/shaders/finalPass.js";
import skyShader from 'src/WebGL/shaders/sky.js';
import simpleShader from "src/WebGL/shaders/simpleColor.js";
import fullScreenShader from "src/WebGL/shaders/fullscreen.js";
import noise64 from "src/external/textures/noise64.png";
import wood from "src/external/textures/wood.png";
import catDiffuse from "src/external/models/Cat-1/Cat_D.png";
import catNormal from "src/external/models/Cat-1/Cat_N.png";
import catSpecular from "src/external/models/Cat-1/Cat_S.png";
import catModel from "src/external/models/Cat-1/Cat.obj";

const initLocalData = {
    // Shaders
    shaders: {
        "BasicLight": basicLightShader,
        "FinalPass":  finalPassShader,
        "Sky": skyShader,
        "SimpleColor": simpleShader,
        "FullScreen": fullScreenShader
    },
    model: {
      "modelType": "custom",
      "model": catModel,
      "textures": {
        "diffuse": {
          path: catDiffuse,
          img: null
        },
        "normalMap": {
          path: catNormal,
          img: null
        },
        "specularMap": {
          path: catSpecular,
          img: null
        }
      },
    },
    images: {
      "noise64": {
        path: noise64,
        img: null
      },
      "wood": {
        path: wood,
        img: null
      }
    }
}

export default initLocalData;

  
