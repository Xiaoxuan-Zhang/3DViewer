import WebGLRenderer from 'src/WebGL/renderer.js';
import UI from 'src/GUI/UI.js';
import './style/style.scss';
import basicLightShader from 'src/WebGL/shaders/basicLight.js';
import skyShader from 'src/WebGL/shaders/sky.js';
import simpleShader from "src/WebGL/shaders/simpleColor.js";
import noise64 from "src/external/textures/noise64.png";
import catDiffuse from "src/external/models/Cat-1/Cat_D.png";
import catNormal from "src/external/models/Cat-1/Cat_N.png";
import catSpecular from "src/external/models/Cat-1/Cat_S.png";
import catModel from "src/external/models/Cat-1/Cat.obj";
import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import SimpleLight from "src/WebGL/simpleLight.js";
import Cube from "src/WebGL/geometries/cube.js";
import Square from "src/WebGL/geometries/square.js";
import CustomObject from "src/WebGL/geometries/object.js";
import Texture from "src/WebGL/texture.js";

const imageObjects = {};
const localShaders = [];
const CANVAS_ID = "webgl-canvas";

const load = () => {
  // TODO: add an animated loading indicator

  // Load local resources
  initLocalData();

  let imageList = [
    {id: "cat_diffuse", path :catDiffuse},
    {id: "cat_normal", path: catNormal},
    {id: "cat_specular", path: catSpecular},
    {id: "noise64", path: noise64}
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
      if (sessionStorage && "textarea-BasicLight" in sessionStorage) {
        basicLightShader.fragment = sessionStorage["textarea-BasicLight"];
      }
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
  
  //  Add some 3D stuff
  const cube = createCube({
    translate: [-2.0, -1.0, -10.0],
    scale: [0.5, 0.5, 0.5],
    rotateDegree: 30,
    rotateAxis: [0, 1, 1],
    autoRotate: true
  });
  scene.addGeometry(cube);

  const cube1 = createCube({
    translate: [2.0, -1.0, -10.0],
    scale: [0.5, 0.5, 0.5],
    rotateDegree: 30,
    rotateAxis: [1, 1, 0],
    autoRotate: true
  });
  scene.addGeometry(cube1);
  
  const ground = createGround({
    translate: [0.0, -3.0, -10.0],
    scale: [100.0, 100.0, 100.0],
    rotateDegree: -90,
    rotateAxis: [1, 0, 0]
  });
  scene.addGeometry(ground);

  const cat = createObject({
    translate: [0.0, -1.0, -5.0]
  });
  scene.addGeometry(cat);

  //Add a skybox
  const skybox = createSkybox();
  scene.skybox = skybox;

  const light = new SimpleLight({});
  scene.setLight(light);
  return { scene, camera };
}

const createCube = ({
  translate=[0.0, 0.0, 0.0], 
  scale=[1.0, 1.0, 1.0], 
  rotateDegree=0.0, 
  rotateAxis=[0,1,0], 
  autoRotate=false
}) => {
  const geo = new Cube();
  const uniforms = {
    u_model: {type: "mat4", value: geo.modelMatrix},
    u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
    u_sample: {type: "texture", value: new Texture(imageObjects["cat_diffuse"])},
    u_specular: {type: "texture", value: new Texture(imageObjects["cat_specular"])},
    u_normal: {type: "texture", value: new Texture(imageObjects["cat_normal"])},
  };
  
  const material = new Material({uniforms, shaders: basicLightShader});
  geo.addMaterial(material);
  geo.translate(translate);
  geo.rotate(rotateDegree, rotateAxis);
  geo.scale(scale);
  geo.autoRotate = autoRotate;
  return geo;
}

const createGround = ({
  translate=[0.0, 0.0, 0.0], 
  scale=[1.0, 1.0, 1.0], 
  rotateDegree=0.0, 
  rotateAxis=[0,1,0], 
  autoRotate=false
}) => {
  const geo = new Square();
  
  const uniforms = {
    u_model: {type: "mat4", value: geo.modelMatrix},
    u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
    u_color: {type: "v3", value: [0.5, 0.3, 0.3]}
  };
  
  const material = new Material({uniforms, shaders: simpleShader});
  geo.addMaterial(material);
  geo.translate(translate);
  geo.rotate(rotateDegree, rotateAxis);
  geo.scale(scale);
  geo.autoRotate = autoRotate;
  return geo;
}

const createSkybox = () => {
  const geo = new Square();
  const uniforms = {
    u_noisemap: {type: "texture", value: new Texture(imageObjects["noise64"])},
    u_time: {type: "t", value: 0.0}
  };
  const material = new Material({uniforms, shaders: skyShader});
  geo.addMaterial(material);
  return geo;
}

const createObject = ({
  translate=[0.0, 0.0, 0.0], 
  scale=[1.0, 1.0, 1.0], 
  rotateDegree=0.0, 
  rotateAxis=[0,1,0], 
  autoRotate=false
}) => {
  const geo = new CustomObject(catModel);
  const uniforms = {
    u_model: {type: "mat4", value: geo.modelMatrix},
    u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
    u_sample: {type: "texture", value: new Texture(imageObjects["cat_diffuse"])},
    u_specular: {type: "texture", value: new Texture(imageObjects["cat_specular"])},
    u_normal: {type: "texture", value: new Texture(imageObjects["cat_normal"])},
  };
  const material = new Material({uniforms, shaders: basicLightShader});
  geo.addMaterial(material);
  geo.translate(translate);
  geo.rotate(rotateDegree, rotateAxis);
  geo.scale(scale);
  geo.autoRotate = autoRotate;
  return geo;
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
