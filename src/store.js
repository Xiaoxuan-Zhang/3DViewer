import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import finalPassShader from "src/WebGL/shaders/finalPass.js";
import skyShader from 'src/WebGL/shaders/sky.js';
import simpleShader from "src/WebGL/shaders/simpleColor.js";
import fullScreenShader from "src/WebGL/shaders/fullscreen.js";
import zenTimeShader from "src/WebGL/shaders/shadertoy_zentime.js";
import thatCatShader from "src/WebGL/shaders/shadertoy_thatcat.js";
import nowhereShader from "src/WebGL/shaders/shadertoy_nowhere.js";
import mushroomShader from "src/WebGL/shaders/shadertoy_mushroom.js";
import hallomeowyShader from "src/WebGL/shaders/shadertoy_hallomeowy.js";
import getoutShader from "src/WebGL/shaders/shadertoy_getout.js";
import waterShader from "src/WebGL/shaders/shadertoy_water.js";
import cloudShader from "src/WebGL/shaders/shadertoy_cloud.js";
import transparentShader from "src/WebGL/shaders/shadertoy_transparent.js";
import cloud2dShader from "src/WebGL/shaders/shadertoy_cloud2D.js";
import noise64 from "src/external/textures/noise64.png";
import noise256 from "src/external/textures/noise256.png";
import stone from "src/external/textures/cobble.png";
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
        "Nowhere": nowhereShader,
        "Mushroom": mushroomShader,
        "Halloween": hallomeowyShader,
        "GetOut": getoutShader,
        "Water": waterShader,
        "Cloud": cloudShader,
        "Cloud2D": cloud2dShader,
        "Transparency": transparentShader
      }
    },
    textures: {
      "FullScreen": ["noise64"],
      "ZenTime": ["noise64"],
      "ThatCat": ["noise64"],
      "Nowhere": ["noise64"],
      "Mushroom": ["noise64", "stone"],
      "Halloween": ["noise64"],
      "GetOut": [],
      "Water": ["noise64", "stone"],
      "Cloud": ["noise64"],
      "Cloud2D": [],
      "Transparency": []
    },
    currentShader: {
      "2D": "ZenTime",
      "3D": "BasicLight"
    },
    currentScene: "2D",
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
      "noise256": {
        path: noise256,
        img: null
      },
      "wood": {
        path: wood,
        img: null
      },
      "stone": {
        path: stone,
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

  
