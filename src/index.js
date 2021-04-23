import WebGLRenderer from 'src/WebGL/renderer.js';
import UI from 'src/GUI/UI.js';
import './style/style.scss';
import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import catDiffuse from "src/external/models/Cat-1/Cat_D.png";
import catNormal from "src/external/models/Cat-1/Cat_N.png";
import catSpecular from "src/external/models/Cat-1/Cat_S.png";
import catModel from "src/external/models/Cat-1/Cat.obj";

const imageObjects = [];
const localShaders = [];
const localModels = [];

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
      imageObjects.push({name: id, image: img});
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
  sessionStorage['vertex'] = basicLightShader.vertex;
  sessionStorage['frag'] = basicLightShader.fragment;

  // Models
  localModels.push({name: "cat", model: catModel});
}

const tick = (renderer) => {
  renderer.update();
  requestAnimationFrame( () => tick(renderer));
}

const render = () => {
    // Initialize canvas and webgl context
    const renderer = new WebGLRenderer('webgl-canvas');
    renderer.loadImages(imageObjects);
    renderer.loadShaders(localShaders);
    renderer.loadModels(localModels);
    renderer.createScene();
    renderer.createBufferData();
    // Initialize UI elements
    const ui = Object.create(UI);
    ui.init();

    tick(renderer);
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
