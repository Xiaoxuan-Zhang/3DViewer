import './style/style.scss';
import Store from "src/store.js";
import { render } from "src/app.js";

// Create promises for loading images
const addImageLoaderPromises = images => {
  return Object.keys(images).map( key => {
    const imgPath = images[key].path;
    if (!imgPath) return null;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve({img, key}));
      img.addEventListener('error', (err) => reject(err));
      img.src = images[key].path;
    })
    .then( ({img, key}) => {
      images[key].img = img;
      return {img, key};
    })
  })
}

const loadContent = () => {
  
  // TODO: add an animated loading page
  
  // Load local resources
  let promiseList = [];
  const models = Store.getById("model");
  // console.log(models);
  // const objMesh = load(models["cup"].model, [OBJLoader]);

  // Load example 3D model textures
  Object.keys(models).forEach( key => {
    const model = models[key];
    const textures = model.textures;
    promiseList = promiseList.concat(addImageLoaderPromises(textures));
  })

  // Load images
  const images = Store.getById("images");
  promiseList = promiseList.concat(addImageLoaderPromises(images));
  
  // Load cubemaps
  const cubemaps = Store.getById("cubemaps");
  Object.keys(cubemaps).forEach( key => {
    const cubemapTextures = cubemaps[key];
    promiseList = promiseList.concat(addImageLoaderPromises(cubemapTextures));
  })

  // Wait for all promises to resolve before rendering
  Promise.all(promiseList)
  .then(() => {
    /* 
      Update the upated values back to store, 
      even though the store data has already been mutated due to the shallow copy of the object.
    */
    Store.setDataById("model", models);
    Store.setDataById("images", images);
    render();
  })
  .catch( err => {
    console.log("Error occurred when loading static files: ", err);
  })
  
  return true;
};

window.onload = loadContent();



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
