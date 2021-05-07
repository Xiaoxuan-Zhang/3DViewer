import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import Texture from "src/WebGL/texture.js";
import SimpleLight from "src/WebGL/simpleLight.js";
import Cube from "src/WebGL/geometries/cube.js";
import Square from "src/WebGL/geometries/square.js";
import CustomObject from "src/WebGL/geometries/object.js";
  
const createCube = (store, {
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
        u_sample: {type: "texture", value: new Texture(store.images["wood"].img)},
    };
    const material = new Material({uniforms, shaders: store.shaders["BasicLight"]});
    geo.addMaterial(material);
    geo.translate(translate);
    geo.rotate(rotateDegree, rotateAxis);
    geo.scale(scale);
    geo.autoRotate = autoRotate;
    return geo;
}
  
const createGround = (store, {
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
      u_color: {type: "v3", value: [0.8, 0.8, 0.8]}
    };
    
    const material = new Material({uniforms, shaders: store.shaders["SimpleColor"]});
    geo.addMaterial(material);
    geo.translate(translate);
    geo.rotate(rotateDegree, rotateAxis);
    geo.scale(scale);
    geo.autoRotate = autoRotate;
    return geo;
}
  
const createSkybox = (store) => {
    const geo = new Square();
    const uniforms = {
      u_noisemap: {type: "texture", value: new Texture(store.images["noise64"].img)},
      u_time: {type: "t", value: 0.0}
    };
    const material = new Material({uniforms, shaders: store.shaders["Sky"]});
    geo.addMaterial(material);
    return geo;
}
  
const createObject = (store, {
    translate=[0.0, 0.0, 0.0], 
    scale=[1.0, 1.0, 1.0], 
    rotateDegree=0.0, 
    rotateAxis=[0,1,0], 
    autoRotate=false
}) => {
    const {model, shaders} = store;
    if (!model.model) return null;
    const geo = new CustomObject(model.model);
    geo.translate(translate);
    geo.rotate(rotateDegree, rotateAxis);
    geo.scale(scale);
    geo.autoRotate = autoRotate;
    const uniforms = {
      u_model: {type: "mat4", value: geo.modelMatrix},
      u_normalMatrix: {type: "mat4", value: geo.normalMatrix}
    };
    const maps = model.textures;
    Object.keys(maps).forEach( key => {
      const { img } = maps[key];
      let uniformKey = "u_sample";
      if (key === "specularMap") {
        uniformKey = "u_specular";
      } else if (key === "normalMap") {
        uniformKey = "u_normal";
      } else {
        uniformKey = "u_sample"
      }
      uniforms[uniformKey] = {type: "texture", value: new Texture(img)};
    })
    const material = new Material({uniforms, shaders: shaders["BasicLight"]});
    geo.addMaterial(material);
    return geo;
}

const create3DScene = (store) => {
    const scene = new Scene();
    const camera = new Camera();
    camera.setPerspective(40.0, 2, 0.1, 100);
    camera.setPosition([0.0, 0.0, 1.0]);
    const { modelType } = store.model;
    if (modelType === "custom") {
      const customObj = createObject(store, {
        modelData: store.model,
        translate: [0.0, -1.0, -2.0]
      });
      scene.addGeometry(customObj);
    } else {
      //  Add some 3D stuff
      const cube = createCube(store, {
        translate: [-2.0, -1.0, -5.0],
        scale: [0.5, 0.5, 0.5],
        rotateDegree: 30,
        rotateAxis: [0, 0, 1],
        autoRotate: true
      });
      scene.addGeometry(cube);
    }
    
    const ground = createGround(store, {
      translate: [0.0, -3.0, 0.0],
      scale: [50.0, 50.0, 50.0],
      rotateDegree: -90,
      rotateAxis: [1, 0, 0]
    });
    scene.addGeometry(ground);
  
    //Add a skybox
    const skybox = createSkybox(store);
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
    
    const uniforms = {
      u_sample: {type: "texture", value: new Texture(store.images["noise64"].img)},
      u_time: {type: "t", value: performance.now()},
      u_mouse: {type: "mouse", value: null}
    };
    
    const material = new Material({uniforms, shaders: store.shaders["FullScreen"]});
    geo.addMaterial(material);
    scene.addGeometry(geo);
    return { scene, camera };
}

export {
    create3DScene,
    createFullScreenSquad
};