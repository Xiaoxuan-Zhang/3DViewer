import WebGLRenderer from 'src/WebGL/renderer.js';
import UI from 'src/GUI/UI.js';
import Store from "src/store.js";
import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import Texture from "src/WebGL/texture.js";
import Cubemap from "src/WebGL/cubemap.js";
import SimpleLight from "src/WebGL/simpleLight.js";
import Cube from "src/WebGL/geometries/cube.js";
import Square from "src/WebGL/geometries/square.js";
import CustomObject from "src/WebGL/geometries/object.js";

const CANVAS_ID = "webgl-canvas";

const _createCube = (data, {
    translate=[0.0, 0.0, 0.0], 
    scale=[1.0, 1.0, 1.0], 
    rotateDegree=0.0, 
    rotateAxis=[0,1,0], 
    autoRotate=false
}) => {
    const geo = new Cube();
    const { images, shaders } = data;
    const texImg = images["wood"].img;
    const uniforms = {
        u_model: {type: "mat4", value: geo.modelMatrix},
        u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
        u_sample: {type: "texture", value: new Texture(texImg)},
    };
    const lightShader = shaders["3D"]["BasicLight"];
    const material = new Material({uniforms, shaders: lightShader});
    geo.addMaterial(material);
    geo.translate(translate);
    geo.rotate(rotateDegree, rotateAxis);
    geo.scale(scale);
    geo.autoRotate = autoRotate;
    return geo;
}
  
const _createGround = (data, {
    translate=[0.0, 0.0, 0.0], 
    scale=[1.0, 1.0, 1.0], 
    rotateDegree=0.0, 
    rotateAxis=[0,1,0], 
    autoRotate=false
}) => {
    const geo = new Square();
    const { shaders } = data;
    const uniforms = {
      u_model: {type: "mat4", value: geo.modelMatrix},
      u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
      u_color: {type: "v3", value: [0.8, 0.8, 0.8]}
    };
    const colorShader = shaders["3D"]["SimpleColor"];
    const material = new Material({uniforms, shaders: colorShader});
    geo.addMaterial(material);
    geo.translate(translate);
    geo.rotate(rotateDegree, rotateAxis);
    geo.scale(scale);
    geo.autoRotate = autoRotate;
    return geo;
}
  
const _createSkybox = (data) => {
    const geo = new Square();
    const { images, shaders } = data;
    const texImg = images["noise64"].img;
    const skyShader = shaders["3D"]["Sky"];
    const uniforms = {
      u_noisemap: {type: "texture", value: new Texture(texImg)},
      u_time: {type: "t", value: 0.0}
    };
    const material = new Material({uniforms, shaders: skyShader});
    geo.addMaterial(material);
    return geo;
}
  
const _createObject = (data) => {
    const { model, shaders, currentModel } = data;
    const defaultModel = model[currentModel];
    if (!defaultModel.model) return null;
    // Create new obj mesh here 
    /* 
      let meshObj = model.model;
      if (typeof meshObj === "string") {
        // Parse text to mesh object
        meshObj = new Mesh(meshObj);
      }
      const geo = new CustomObject(meshObj);
    */
   
    const geo = new CustomObject(defaultModel.model);
    const transform = defaultModel["transform"];
    const translate = transform["translate"] || [0.0, 0.0, 0.0];
    const scale = transform["scale"] || [1.0, 1.0, 1.0]; 
    const rotateDegree = transform["rotateDegree"] || 0.0; 
    const rotateAxis = transform["rotateAxis"] || [0, 1, 0];
    const autoRotate = transform["autoRotate"] || false;
    geo.translate(translate);
    geo.scale(scale);
    geo.rotate(rotateDegree, rotateAxis);
    geo.autoRotate = autoRotate;
    const uniforms = {
      u_model: {type: "mat4", value: geo.modelMatrix},
      u_normalMatrix: {type: "mat4", value: geo.normalMatrix}
    };
    const maps = defaultModel.textures;
    
    Object.keys(maps).forEach(key => {
      const img = maps[key].img;
      if ( img ) {
        uniforms[`u_${key}`] = {type: "texture", value: new Texture(maps[key].img)};
      }
    })
    const material = new Material({uniforms, shaders: shaders["3D"]["PBR"]});
    geo.addMaterial(material);
    return geo;
}

const create3DScene = (store) => {
    const scene = new Scene();
    const camera = new Camera();
    camera.setPerspective(40.0, 2, 0.1, 100);
    camera.setPosition([0.0, 0.0, 1.0]);
    const storeData = store.get();
    const { model, currentModel } = storeData;
    const newModel = model[currentModel];
    
    if (newModel.modelType === "custom") {
      const customObj = _createObject(storeData);
      scene.addGeometry(customObj);
    } else {
      //  Add some 3D stuff
      const cube = _createCube(storeData, {
        translate: [-2.0, -1.0, -5.0],
        scale: [0.5, 0.5, 0.5],
        rotateDegree: 30,
        rotateAxis: [0, 0, 1],
        autoRotate: true
      });
      scene.addGeometry(cube);
    }
    
    const ground = _createGround(storeData, {
      translate: [0.0, -3.0, 0.0],
      scale: [50.0, 50.0, 50.0],
      rotateDegree: -90,
      rotateAxis: [1, 0, 0]
    });
    scene.addGeometry(ground);
  
    // //Add a skybox
    const skybox = _createSkybox(storeData);
    scene.skybox = skybox;
  
    const light = new SimpleLight({});
    scene.setLight(light);
    return { scene, camera };
}

const createFullScreenSquad = store => {
    const scene = new Scene();
    const camera = new Camera();

    //  Add square
    const geo = new Square();
    const storeData = store.get();
    const { textures, images, cubemaps, cubemapTextures } = storeData;
    const uniforms = {
      u_time: {type: "t"},
      u_mouse: {type: "mouse"},
      u_resolution: {type: "resolution"}
    };
    const currentShader = storeData.currentShader["2D"];
    const shader = storeData.shaders["2D"][currentShader];
    // Set 2D texture
    if (currentShader in textures) {
      textures[currentShader].forEach( (item, i) => {
        let idx = i === 0 ? "" : i;
        uniforms[`u_sample${idx}`] = {type: "texture", value: new Texture(images[item].img)};
      })
    }
    // Set cubemap texture
    if (currentShader in cubemapTextures) {
      cubemapTextures[currentShader].forEach( (item, i) => {
        let idx = i === 0 ? "" : i;
        uniforms[`u_cubemap${idx}`] = {type: "cubemap", value: new Cubemap(cubemaps[item])};
      })
    }
    const material = new Material({uniforms, shaders: shader});
    geo.addMaterial(material);
    scene.addGeometry(geo);
    return { scene, camera };
}

const initScene = (renderer, sceneType, store) => {
  if (sceneType === "3D") {
    const { scene, camera } = create3DScene(store);
    renderer.init(scene, camera); 
  } else {
    const { scene, camera } = createFullScreenSquad(store);
    renderer.init(scene, camera);
  }
}

const render = () => {
  const renderer = new WebGLRenderer(CANVAS_ID);
  const ui = UI(Store);
  const currentScene = Store.getById("currentScene");
  // Initialize canvas and webgl context
  initScene(renderer, currentScene, Store);

  window.addEventListener("resize", () => {
    renderer.resizeCanvas();
  }, false);

  ui.addListener( "SUBMIT_SHADER", (selectedScene, selectedShader) => {
    if (sessionStorage && `textarea-${selectedShader}` in sessionStorage) {
      const currShaders = Store.getById("shaders");
      currShaders[selectedScene][selectedShader].fragment = sessionStorage[`textarea-${selectedShader}`];
      Store.setDataById("shaders", currShaders);
    }
    initScene(renderer, selectedScene, Store);
  });

  ui.addListener("SELECT_SCENE", selected => {
    initScene(renderer, selected, Store);
  })

  ui.addListener("UPDATE_MODEL", () => {
    initScene(renderer, "3D", Store);
  })

  ui.addListener("SELECT_SHADER_2D", (selectedShader) => {
    const currentShader = Store.getById("currentShader");
    currentShader["2D"] = selectedShader;
    Store.setDataById("currentShader", currentShader);
  })

  ui.addListener("SELECT_SHADER_3D", (selectedShader) => {
    const currentShader = Store.getById("currentShader");
    currentShader["3D"] = selectedShader;
    Store.setDataById("currentShader", currentShader);
  })
  
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render();
  }
  animate();
}

export {
    create3DScene,
    createFullScreenSquad,
    render
};