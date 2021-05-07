import WebGLRenderer from 'src/WebGL/renderer.js';
import UI from 'src/GUI/UI.js';
import './style/style.scss';
import Store from "src/store.js";
import { create3DScene, createFullScreenSquad } from "src/app.js";

const CANVAS_ID = "webgl-canvas";

const load = () => {
  
  // TODO: add an animated loading indicator

  // Load local resources
  let promiseList = [];
  const textures = Store.model.textures;
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
  const images = Store.images;
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
    render();
  })
  .catch( err => {
    console.log("Error occurred when loading static files: ", err);
  })
  
  return true;
};

const render = () => {
  const renderer = new WebGLRenderer(CANVAS_ID);
  const ui = UI(Store);
  // Initialize canvas and webgl context
  const { scene, camera } = create3DScene(Store);
  renderer.init(scene, camera);

  window.addEventListener("resize", () => {
    renderer.resizeCanvas();
  }, false);

  ui.addListener( "SUBMIT_SHADER", () => {
    if (sessionStorage && "textarea-BasicLight" in sessionStorage) {
      Store.shaders["BasicLight"].fragment = sessionStorage["textarea-BasicLight"];
    }
    renderer.init(scene, camera);
  });

  ui.addListener("SELECT_SCENE", option => {
    if (option === "2d") {
      const { scene, camera } = createFullScreenSquad(Store);
      renderer.init(scene, camera);
    } else {
      const { scene, camera } = create3DScene(Store);
      renderer.init(scene, camera);
    }
  })

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render();
  }
  animate();
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
