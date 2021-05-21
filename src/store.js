//import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import finalPassShader from "src/WebGL/shaders/finalPass.js";
import skyShader from 'src/WebGL/shaders/sky.js';
import simpleShader from "src/WebGL/shaders/simpleColor.js";
import pbrShader from "src/WebGL/shaders/pbr.js";
import blankShader from "src/WebGL/shaders/blank.js";
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
import bigbangShader from "src/WebGL/shaders/shadertoy_bigbang.js";
import setShader from "src/WebGL/shaders/shadertoy_set.js";
import glassyShader from "src/WebGL/shaders/shadertoy_glassy.js";
import glowShader from "src/WebGL/shaders/shadertoy_glow.js";
import noise64 from "src/external/textures/noise64.png";
import noise256 from "src/external/textures/noise256.png";
import stone from "src/external/textures/cobble.png";
import wood from "src/external/textures/wood.png";
import caseModel from "src/external/models/chemodan/suitcase.obj";
import caseAO from "src/external/models/chemodan/textures/ao.jpg";
import caseColor from "src/external/models/chemodan/textures/color.jpg";
import caseMetal from "src/external/models/chemodan/textures/metallic.jpg";
import caseRough from "src/external/models/chemodan/textures/roughness.jpg";
import caseNormal from "src/external/models/chemodan/textures/normal.jpg";
import cupModel from "src/external/models/coffee_cup/coffee_cup_obj.obj";
import cupColor from "src/external/models/coffee_cup/textures/Base_color.png";
import cupNormal from "src/external/models/coffee_cup/textures/normal.png";
import cupRough from "src/external/models/coffee_cup/textures/roughness.png";
import cupMetal from "src/external/models/coffee_cup/textures/metallic.png";
import buildingFace0 from "src/external/cubemap_building/face0.png";
import buildingFace1 from "src/external/cubemap_building/face1.png";
import buildingFace2 from "src/external/cubemap_building/face2.png";
import buildingFace3 from "src/external/cubemap_building/face3.png";
import buildingFace4 from "src/external/cubemap_building/face4.png";
import buildingFace5 from "src/external/cubemap_building/face5.png";
import forestFace0 from "src/external/cubemap_forest/face0.png";
import forestFace1 from "src/external/cubemap_forest/face1.png";
import forestFace2 from "src/external/cubemap_forest/face2.png";
import forestFace3 from "src/external/cubemap_forest/face3.png";
import forestFace4 from "src/external/cubemap_forest/face4.png";
import forestFace5 from "src/external/cubemap_forest/face5.png";

const appData = {
    // Shaders
    shaders: {
      "3D": {
        //"BasicLight": basicLightShader,
        "FinalPass":  finalPassShader,
        "SimpleColor": simpleShader,
        "Sky": skyShader,
        "PBR": pbrShader
      },
      "2D": {
        "Blank": blankShader,
        "ZenTime": zenTimeShader,
        "ThatCat": thatCatShader,
        "Nowhere": nowhereShader,
        "Mushroom": mushroomShader,
        "Halloween": hallomeowyShader,
        "GetOut": getoutShader,
        "Water": waterShader,
        "Cloud": cloudShader,
        "Cloud2D": cloud2dShader,
        "Transparency": transparentShader,
        "BigBang": bigbangShader,
        "Set": setShader,
        "Glassy": glassyShader,
        "Glow": glowShader
      }
    },
    textures: {
      "Blank": ["stone"],
      "ThatCat": ["noise64"],
      "Nowhere": ["noise64"],
      "Mushroom": ["noise64", "stone"],
      "Halloween": ["noise64"],
      "Water": ["noise64", "stone"],
      "Cloud": ["noise64"],
      "Glassy": ["stone"]
    },
    cubemapTextures: {
      "BigBang": ["building"],
      "Glassy": ["forest"],
      "Glow": ["forest"]
    },
    currentShader: {
      "2D": "ZenTime",
      "3D": "PBR"
    },
    currentScene: "3D",
    currentModel: "case",
    model: {
      "case": {
        "modelType": "custom",
        "model": caseModel,
        "transform": {
          "translate": [0.0, -2.0, -5.0],
          "scale": [0.1, 0.1, 0.1]
        },
        "textures": {
          "normal": {
            path: caseNormal,
            img: null,
            desc: "Normal Map"
          },
          "color": {
            path: caseColor,
            img: null,
            desc: "Color"
          },
          "metallic": {
            path: caseMetal,
            img: null,
            desc: "Metallic"
          },
          "roughness": {
            path: caseRough,
            img: null,
            desc: "Roughness"
          },
          "ao": {
            path: caseAO,
            img: null,
            desc: "AmbientOcclusion"
          },
          "emission": {
            path: null,
            img: null,
            desc: "Emission"
          }
        },
      },
      "cup": {
        "modelType": "custom",
        "model": cupModel,
        "transform": {
          "translate": [0.0, -0.5, -2.0]
        },
        "textures": {
          "normal": {
            path: cupNormal,
            img: null,
            desc: "Normal Map"
          },
          "color": {
            path: cupColor,
            img: null,
            desc: "Color"
          },
          "metallic": {
            path: cupMetal,
            img: null,
            desc: "Metallic"
          },
          "roughness": {
            path: cupRough,
            img: null,
            desc: "Roughness"
          }
        }
      }
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
    },
    cubemaps: {
      "building": {
        "right": {
          path: buildingFace0,
          img: null
        },
        "left": {
          path: buildingFace1,
          img: null
        },
        "top": { 
          path: buildingFace2,
          img: null
        },
        "bottom": {
          path: buildingFace3,
          img: null
        },
        "front": {
          path: buildingFace4,
          img: null
        },
        "back": {
          path: buildingFace5,
          img: null
        }
      },
      "forest": {
        "right": {
          path: forestFace0,
          img: null
        },
        "left": {
          path: forestFace1,
          img: null
        },
        "top": { 
          path: forestFace2,
          img: null
        },
        "bottom": {
          path: forestFace3,
          img: null
        },
        "front": {
          path: forestFace4,
          img: null
        },
        "back": {
          path: forestFace5,
          img: null
        }
      }
    },
}

/**
 * An object to return appStore data. 
 * Note that since only shallow copy is used, there is no guarantee of the returned value being immutable.
 */
const appStore = {
  get: () => Object.assign({}, appData),
  getById: id => {
    if (Array.isArray(appData[id])) {
      //Shallow copy
      return [...appData[id]];
    } else if (typeof appData[id] === "object") {
      //Shallow copy
      return Object.assign({}, appData[id]);
    } else {
      return appData[id];
    }
  },
  setDataById: (id, newData) => {
    appData[id] = Object.assign({}, {...appData[id], ...newData});
  }
}
// No further modifications allowed for this object.
Object.freeze(appStore);

export default appStore;

  
