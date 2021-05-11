import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import Texture from "src/WebGL/texture.js";
import SimpleLight from "src/WebGL/simpleLight.js";
import Cube from "src/WebGL/geometries/cube.js";
import Square from "src/WebGL/geometries/square.js";
import CustomObject from "src/WebGL/geometries/object.js";
  
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
  
const _createObject = (data, {
    translate=[0.0, 0.0, 0.0], 
    scale=[1.0, 1.0, 1.0], 
    rotateDegree=0.0, 
    rotateAxis=[0,1,0], 
    autoRotate=false
}) => {
    const { model, shaders } = data;
    if (!model.model) return null;
    // Create new obj mesh here 
    /* 
      let meshObj = model.model;
      if (typeof meshObj === "string") {
        // Parse text to mesh object
        meshObj = new Mesh(meshObj);
      }
      const geo = new CustomObject(meshObj);
    */
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
    const material = new Material({uniforms, shaders: shaders["3D"]["BasicLight"]});
    geo.addMaterial(material);
    return geo;
}

const create3DScene = (store) => {
    const scene = new Scene();
    const camera = new Camera();
    camera.setPerspective(40.0, 2, 0.1, 100);
    camera.setPosition([0.0, 0.0, 1.0]);
    const storeData = store.get();
    const { model, modelType } = storeData["model"];
    if (modelType === "custom") {
      const customObj = _createObject(storeData, {
        modelData: model,
        translate: [0.0, -1.0, -2.0]
      });
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
    const uniforms = {
      u_sample: {type: "texture", value: new Texture(storeData.images["noise64"].img)},
      u_time: {type: "t"},
      u_mouse: {type: "mouse"},
      u_resolution: {type: "resolution"}
    };
    const currentShader = storeData.currentShader["2D"];
    const material = new Material({uniforms, shaders: storeData.shaders["2D"][currentShader]});
    geo.addMaterial(material);
    scene.addGeometry(geo);
    return { scene, camera };
}

const createNewMesh = objStr => {
}

export {
    create3DScene,
    createFullScreenSquad
};