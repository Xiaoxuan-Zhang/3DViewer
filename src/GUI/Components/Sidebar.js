import UIComponent from "src/GUI/Components/UIComponent.js";

class Sidebar extends UIComponent {
  constructor(id) {
    super();
    const element = document.createElement("div");
    element.id = id;
    element.className = "side-bar-right";
    this.element = element;
  }
  
}

export default Sidebar;
