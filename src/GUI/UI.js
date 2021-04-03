import Panel from 'src/GUI/Components/Panel';
import Sidebar from 'src/GUI/Components/Sidebar';
import TextWidget from 'src/GUI/Components/TextWidget';

const UIComponent = {
  scenePanelId: "scene-panel",
  modelPanelId: "model-panel",
  shaderPanelId: "shader-panel",
  sidebarId: "main-panel",
  vertexShaderEditor: null,
  fragShaderEditor: null,
  init: function(divId) {
    const rootElement = document.createElement("div");
    rootElement.setAttribute("id", "root");
    document.body.appendChild(rootElement);
    const sidebar = new Sidebar(rootElement, this.sidebarId);
    const sceneOptions = "This is a scene panel";
    const modelOptions = "This is a model panel";
    const shaderOptions = "This is a shader panel";
    // parentElement, divId, title, content
    this.scenePanel = new Panel(sidebar, this.scenePanelId, "Scene", sceneOptions);
    this.modelPanel = new Panel(sidebar, this.modelPanelId, "Model", modelOptions);
    this.shaderPanel = new Panel(sidebar, this.shaderPanelId, "Shader", shaderOptions);
    this.initShaderPanel();
  },
  initShaderPanel: function() {
    this.vertexShaderEditor = new TextWidget(this.shaderPanel, "vertex-shader-editor", localStorage['vertex']);
    this.fragShaderEditor = new TextWidget(this.shaderPanel, "frag-shader-editor", localStorage['frag']);
  },
  updateScene: function() {

  },
  updateModel: function() {

  },
  updateShader: function() {

  },
  bindEvents: function() {

  }
}


export default UIComponent;
