import WebGLRenderer from 'src/WebGL/renderer.js';
import UI from 'src/GUI/UI.js';
import './style/style.scss';
import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import catDiffuse from "src/external/models/Cat-1/Cat_D.png";
import catNormal from "src/external/models/Cat-1/Cat_N.png";
import catSpecular from "src/external/models/Cat-1/Cat_S.png";
import catModel from "src/external/models/Cat-1/Cat.obj";
import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import Cube from "src/WebGL/geometries/cube.js";
import Texture from "src/WebGL/texture.js";

const imageObjects = {};
const localShaders = [];
const localModels = [];
const CANVAS_ID = "webgl-canvas";

const load = () => {
  // TODO: add an animated loading indicator

  // Load local resources
  initLocalData();

  let imageList = [
    {id: "cat_diffuse", path :catDiffuse},
    {id: "cat_normal", path: catNormal},
    {id: "cat_specular", path: catSpecular}
  ];
  
  Promise.all(imageList.map(({id, path}) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve({img, id}));
      img.addEventListener('error', (err) => reject(err));
      img.src = path;
    })
    .then( ({img, id}) => {
      imageObjects[id] = img;
    })
  }))
  .then(() => {
    render()
  })
  .catch( err => {
    console.log("Error occurred when loading static files: ", err);
  })
  
  return true;
};

const initLocalData = () => {
  // Shaders
  localShaders.push({name: 'BasicLight', vertex: basicLightShader.vertex, fragment: basicLightShader.fragment});

  // Models
  localModels.push({name: "cat", model: catModel});
}

const render = () => {
    // Initialize canvas and webgl context
    const renderer = new WebGLRenderer(CANVAS_ID);
    const { scene, camera } = createScene();
    renderer.init(scene, camera);
    // Initialize UI elements
    const ui = Object.create(UI);
    ui.addResources("shaders", localShaders);
    ui.init();
    
    ui.addListener( () => {
      localShaders.forEach( shaderInfo => {
        if (shaderInfo.name === "BasicLight") {
          shaderInfo.fragment = sessionStorage["textarea-BasicLight"];
        }
      });
      renderer.loadShaders(localShaders);
      renderer.init(scene, camera);

    });
    ui.bindEvents();
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render();
    }
    animate();
}

const createScene = () => {
  let scene = new Scene();
  let camera = new Camera();
  camera.setPerspective(40.0, 2, 0.1, 100);
  camera.setPosition([0.0, 0.0, 1.0]);
  
  const geo = new Cube();
  const uniforms = {
    u_model: {type: "mat4", value: geo.modelMatrix},
    u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
    u_sample: {type: "texture", value: new Texture(imageObjects["cat_diffuse"])},
    u_specular: {type: "texture", value: new Texture(imageObjects["cat_specular"])},
    u_normal: {type: "texture", value: new Texture(imageObjects["cat_normal"])},
  };
  const shaders = {
    vertex: basicLightShader.vertex,
    fragment: basicLightShader.fragment
  };
  
  const material = new Material({uniforms, shaders});
  geo.addMaterial(material);
  geo.translate(0.0, 0.0, -10.0);
  geo.rotate(30, [1, 1, 0]);
  geo.scale([1.0, 1.0, 1.0]);
  scene.addGeometry(geo);
  return {scene, camera};
}

window.onload = load();


/**
 * Provides requestAnimationFrame in a cross browser
 * way.
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
  })();
}

/** * ERRATA: 'cancelRequestAnimationFrame' renamed to 'cancelAnimationFrame' to reflect an update to the W3C Animation-Timing Spec.
 *
 * Cancels an animation frame request.
 * Checks for cross-browser support, falls back to clearTimeout.
 * @param {number}  Animation frame request. */
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
                                 window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
                                 window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
                                 window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
                                 window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
                                 window.clearTimeout);
}
