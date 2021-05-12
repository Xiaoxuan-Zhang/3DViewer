import './style/style.scss';
import Store from "src/store.js";
import { render } from "src/app.js";

const load = () => {
  
  // TODO: add an animated loading indicator
  
  // Load local resources
  let promiseList = [];
  const textures = Store.getById("model").textures;
  Object.keys(textures).forEach(key => {
    promiseList.push(
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve({img, key}));
        img.addEventListener('error', (err) => reject(err));
        img.src = textures[key].path;
      }).then( ({img, key}) => {
        textures[key].img = img;
      })
    )
  });
  const images = Store.getById("images");
  Object.keys(images).forEach( key => {
    promiseList.push(
      new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve({img, key}));
        img.addEventListener('error', (err) => reject(err));
        img.src = images[key].path;
      })
      .then( ({img, key}) => {
        images[key].img = img;
        
      })
    )
  })

  Promise.all(promiseList)
  .then(() => {
    const model = Store.getById("model");
    model.textures = textures;
    Store.setDataById("model", model);
    Store.setDataById("images", images);
    render();
  })
  .catch( err => {
    console.log("Error occurred when loading static files: ", err);
  })
  
  return true;
};

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
