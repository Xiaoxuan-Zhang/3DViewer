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
    "SELECT_SCENE": []
  };
  let rootElement = document.createElement("div");
  rootElement.setAttribute("id", "ui-root");
  document.body.appendChild(rootElement);
  const sidebar = new Sidebar(sidebarId);
  
  const modelOptions = createModelEditor();
  const shaderOptions = createShaderEditor(store.shaders);

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
      if ("SUBMIT_SHADER" in listeners) {
        listeners["SUBMIT_SHADER"].forEach(func => func(e));
      }
    });
  })

  modelOptions.querySelector("#selector-scene").addEventListener("change", e => {
    const selected = document.getElementById("selector-scene").value;
    if (selected === "2d") {
      toggleModelLoader(false);
    } else {
      toggleModelLoader(true);
    }
    if ("SELECT_SCENE" in listeners) {
      listeners["SELECT_SCENE"].forEach(func => func(selected));
    }
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

const toggleModelLoader = (enabled) => {
  let status = "none";
  if (enabled) {
    status = "block";
  }
  document.getElementById("model-loader").style.display = status;
}

const createModelLoader = () => {
  const loaderDiv = document.createElement("div");
  loaderDiv.id = "model-loader";
  const loaderWrapper = document.createElement("div");
  loaderWrapper.className = "pa2";
  loaderDiv.appendChild(loaderWrapper);
  const loaders = {
    "model": "3D model", 
    "normal": "normal map", 
    "diffuse": "diffuse map", 
    "specular": "specular map"
  };
  Object.keys(loaders).forEach( key => {
    const fileLoaders = new FileLoader(key, loaders[key]);
    loaderWrapper.appendChild(fileLoaders.getElement());
  })
  
  return loaderDiv;
}

const createModelEditor = () => {
  const modelEditorDiv = document.createElement("div");
  modelEditorDiv.setAttribute("id", "model-editor");
  const sceneSelector = new Dropdown("scene", "Select a scene", ["3D", "2D"]);
  modelEditorDiv.appendChild(sceneSelector.getElement());
  const divider = document.createElement("div");
  divider.className = "divider";
  modelEditorDiv.appendChild(divider);
  const modelLoader = createModelLoader();
  modelEditorDiv.appendChild(modelLoader);
  return modelEditorDiv;
}

const createShaderEditor = (shaders) => {
  const shaderEditorDiv = document.createElement("div");
  shaderEditorDiv.setAttribute("id", "shader-editor-wrapper");
  const items = [];
  Object.keys(shaders).forEach( key => {
    const { fragment } = shaders[key];
    const textWidget = new TextWidget(key, key, fragment);
    items.push({title: key, content: textWidget.getElement()});
  })
  const tabs = new Tabs("shader-editor", items);
  shaderEditorDiv.appendChild(tabs.getElement());
  return shaderEditorDiv
}

export default UIComponent;
