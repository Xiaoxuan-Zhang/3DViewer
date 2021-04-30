import Sidebar from 'src/GUI/Components/Sidebar';
import TextWidget from 'src/GUI/Components/TextWidget';
import Accordion from './Components/Accordion';

/**
 * UI component
 *
 * @author "Xiaoxuan Zhang"
 * @public
 */
const UIComponent = {
  sidebarId: "main-panel",
  textEditors: [],
  resources: {},
  listeners: [],
  init: function() {
    const rootElement = document.createElement("div");
    rootElement.setAttribute("id", "ui-root");
    document.body.appendChild(rootElement);
    const sidebar = new Sidebar(this.sidebarId);
    
    const sceneOptions = document.createTextNode("This is a scene panel");
    const modelOptions = document.createTextNode("This is a model panel");
    const shaderOptions = this._createShaderEditor();

    
    this.accordion = new Accordion();
    this.accordion.addItem({name: "Scene", item: sceneOptions});
    this.accordion.addItem({name: "Model", item: modelOptions});
    this.accordion.addItem({name: "Shaders", item: shaderOptions});
    
    sidebar.getElement().appendChild(this.accordion.getElement());
    rootElement.appendChild(sidebar.getElement());

  },
  updateScene: function() {

  },
  updateModel: function() {

  },
  updateShader: function() {

  },
  bindEvents: function() {
    // Shader editor
    this.textEditors.forEach( editor => {
      editor.bindEvent("textarea", "keyup", e => {
        if (e.target) {
          sessionStorage.setItem(e.target.id, e.target.value);
        }
      });
      editor.bindEvent("submit", "click", e => {
        this.listeners.forEach(func => func(e));
      })
    })
  },
  _createShaderEditor: function() {
    const shaderEditorDiv = document.createElement("div");
    if ("shaders" in this.resources) {
      this.resources["shaders"].forEach(({name, fragment}) => {
        const textWidget = new TextWidget(name, name, fragment)
        this.textEditors.push(textWidget);
        shaderEditorDiv.appendChild(textWidget.getElement());
      })
    }
    return shaderEditorDiv
  },
  addResources: function(resourceType, resources) {
    this.resources[resourceType] = resources;
  },
  addListener: function(listener) {
    this.listeners.push(listener);
  }
};

export default UIComponent;
