import Sidebar from 'src/GUI/Components/Sidebar';
import TextWidget from 'src/GUI/Components/TextWidget';
import Accordion from './Components/Accordion';
import FileLoader from "./Components/FileUploader";
import Dropdown from "./Components/Dropdown";
import Tabs from "./Components/Tabs";

/**
 * UI component
 *
 * @author "Xiaoxuan Zhang"
 * @public
 */
const UIComponent = store => {
  let sidebarId = "main-panel";
  let listeners = {
    "SUBMIT_SHADER": [],
    "SELECT_SCENE": [],
    "UPDATE_MODEL": []
  };
  let rootElement = document.createElement("div");
  rootElement.setAttribute("id", "ui-root");
  document.body.appendChild(rootElement);
  const sidebar = new Sidebar(sidebarId);
  
  const modelOptions = createModelEditor(store);
  const shaderOptions = createShaderEditor(store);

  let accordion = new Accordion();
  accordion.addItem({name: "Settings", item: modelOptions});
  accordion.addItem({name: "Shaders", item: shaderOptions});
  
  sidebar.getElement().appendChild(accordion.getElement());
  rootElement.appendChild(sidebar.getElement());

  // Bind events
  shaderOptions.querySelectorAll("textarea").forEach( editor => {
    editor.addEventListener("keyup", e => {
      if (e.target) {
        sessionStorage.setItem(e.target.id, e.target.value);
      }
    });
  })

  shaderOptions.querySelectorAll("a").forEach( btn => {
    btn.addEventListener("click", e => {
      const sceneSelector = document.getElementById("selector-scene");
      const selectedScene = sceneSelector.options[sceneSelector.selectedIndex].text;
      const shaderSelector = document.getElementById(`selector-shader-editor-${sceneSelector.value}`);
      const selectedShader = shaderSelector.options[shaderSelector.selectedIndex].text;
      listeners["SUBMIT_SHADER"].forEach(func => func(selectedScene, selectedShader));
    });
  })

  modelOptions.querySelector("#selector-scene").addEventListener("change", e => {
    const selected = getSelectedOption("selector-scene");
    // Toggle on model loader if 3d is selected
    toggleModelLoader(selected);
    // Toggle corresponding shader tab
    toggleShaderTab(selected);
    listeners["SELECT_SCENE"].forEach(func => func(selected));
  })

  modelOptions.querySelector("#model-editor-submit").addEventListener("click", e => {
    listeners["UPDATE_MODEL"].forEach(func => func());
  })
  
  const addListener = (target, listener) => {
    if (!(target in listeners)) {
      listeners[target] = [];
    }
    listeners[target].push(listener);
  }

  return {
    rootElement,
    addListener
  }
};

const getSelectedOption = id => {
  const ele = document.getElementById(id);
  return ele.options[ele.selectedIndex].text;
}

const createModelLoader = (store) => {
  const loaderDiv = document.createElement("div");
  loaderDiv.id = "model-loader";
  const loaders = {
    "model": "3D Model", 
    "normal": "Normal Map", 
    "diffuse": "Diffuse Map", 
    "specular": "Specular Map"
  };
  const ul = document.createElement("ul");
  ul.className = "list pl0 measure center mt1 mb1";
  loaderDiv.appendChild(ul);
  Object.keys(loaders).forEach( key => {
    const accept = key === "model" ? ".obj" : "image/*";
    const fileLoaders = new FileLoader(key, loaders[key], accept);
    fileLoaders.bindEvent(null, "change", file => {
      if (key === "model") {
        //Process model
        processObj(store, key, file, updateObjToStore);
      } else {
        //
        processImage(store, key, file, updateTextureToStore);
      }
    })
    const li = document.createElement("li");
    li.className = "lh-copy pv1 ba bl-0 bt-0 br-0 b--dotted b--white-30";
    li.appendChild(fileLoaders.getElement())
    ul.appendChild(li);
  })
  const submitBtn = document.createElement("a");
  submitBtn.id = "model-editor-submit";
  submitBtn.className = "f7 link dim br1 ph3 pv2 mb2 mt2 dib white bg-dark-green cursor-pointer";
  submitBtn.innerText = "Update";
  loaderDiv.appendChild(submitBtn);
  return loaderDiv;
}

const processImage = (store, key, file, imageHandler) => {
  const reader = new FileReader();
  const image = new Image();
  reader.onload = e => {
    image.src = e.target.result;
    imageHandler(store, key, image);
  }
  reader.readAsDataURL(file);
}

const processObj = (store, key, file, objHandler) => {
  const reader = new FileReader();
  reader.onload = e => {
    objHandler(store, key, e.target.result);
  }
  reader.readAsText(file);
}

const updateTextureToStore = (store, key, fileObj) => {
  const model = store.getById("model");
  model.textures[`${key}Map`].img = fileObj;
  store.setDataById("model", model);
}

const updateObjToStore = (store, key, fileObj) => {
  const model = store.getById("model");
  model[key] = fileObj;
  store.setDataById("model", model);
}

const createModelEditor = (store) => {
  const currentScene = store.getById("currentScene");
  const modelEditorDiv = document.createElement("div");
  modelEditorDiv.setAttribute("id", "model-editor");
  const sceneSelector = new Dropdown("scene", "Select a scene", ["3D", "2D"], currentScene);
  modelEditorDiv.appendChild(sceneSelector.getElement());
  const divider = document.createElement("div");
  divider.className = "divider";
  modelEditorDiv.appendChild(divider);
  const modelLoader = createModelLoader(store);
  if (currentScene === "2D") {
    modelLoader.style.display = "none";
  }
  modelEditorDiv.appendChild(modelLoader);
  
  return modelEditorDiv;
}

const toggleModelLoader = (type) => {
  const enabled = type === "2D" ? false : true;
  const ele = document.getElementById("model-loader");
  if (ele) {
    ele.style.display = enabled ? "block" : "none";
  }
}

const toggleShaderTab = (type) => {
  const enabled3D = type === "3D"? "block" : "none";
  const div2d = document.getElementById("editor-2d");
  const div3d = document.getElementById("editor-3d");
  div2d.style.display = !enabled3D;
  div3d.style.display = enabled3D;
}

const createShaderEditor = (store) => {
  const { shaders, currentShader, currentScene } = store.get();
  const shaderEditorDiv = document.createElement("div");
  shaderEditorDiv.setAttribute("id", "shader-editor-wrapper");
  // Add wrappers for different shader types in order to respond to 3D/2D scene
  Object.keys(shaders).forEach( type => {
    const typeLower = type.toLowerCase();
    const wrapper = document.createElement("div");
    wrapper.id = `editor-${typeLower}`;
    const shaderItems = shaders[type];
    // Add text widgets for all shaders
    const items = [];
    const current = currentShader[type];
    Object.keys(shaderItems).forEach( id => {
      const { fragment } = shaderItems[id];
      const textWidget = new TextWidget(id, id, fragment);
      items.push({title: id, content: textWidget.getElement()});
    })
    const tabs = new Tabs(`shader-editor-${typeLower}`, items, current);
    wrapper.appendChild(tabs.getElement());
    if (type !== currentScene) {
      // Hide 2d/3d wrapper by default
      wrapper.style.display = "none"
    }
    shaderEditorDiv.appendChild(wrapper);
  })
  return shaderEditorDiv
}

export default UIComponent;
