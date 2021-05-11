import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import finalPassShader from "src/WebGL/shaders/finalPass.js";
import skyShader from 'src/WebGL/shaders/sky.js';
import simpleShader from "src/WebGL/shaders/simpleColor.js";
import fullScreenShader from "src/WebGL/shaders/fullscreen.js";
import zenTimeShader from "src/WebGL/shaders/shadertoy_zentime.js";
import thatCatShader from "src/WebGL/shaders/shadertoy_thatcat.js";
import noise64 from "src/external/textures/noise64.png";
import wood from "src/external/textures/wood.png";
import catDiffuse from "src/external/models/Cat-1/Cat_D.png";
import catNormal from "src/external/models/Cat-1/Cat_N.png";
import catSpecular from "src/external/models/Cat-1/Cat_S.png";
import catModel from "src/external/models/Cat-1/Cat.obj";

const appData = {
    // Shaders
    shaders: {
      "3D": {
        "BasicLight": basicLightShader,
        "FinalPass":  finalPassShader,
        "SimpleColor": simpleShader,
        "Sky": skyShader
      },
      "2D": {
        "FullScreen": fullScreenShader,
        "ZenTime": zenTimeShader,
        "ThatCat": thatCatShader,
      }
    },
    currentShader: {
      "2D": "ZenTime",
      "3D": "BasicLight"
    },
    model: {
      "modelType": "custom",
      "model": catModel,
      "textures": {
        "diffuseMap": {
          path: catDiffuse,
          img: null,
          desc: "Diffuse Map"
        },
        "normalMap": {
          path: catNormal,
          img: null,
          desc: "Normal Map"
        },
        "specularMap": {
          path: catSpecular,
          img: null,
          desc: "Specular Map"
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
const appStore = {
  get: () => Object.assign({}, appData),
  getById: id => Object.assign({}, appData[id]),
  setDataById: (id, newData) => {
    appData[id] = Object.assign({}, {...appData[id], ...newData});
  }
}

Object.freeze(appStore);

export default appStore;

  
