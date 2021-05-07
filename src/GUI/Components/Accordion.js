import UIComponent from "src/GUI/Components/UIComponent.js";

class Accordion extends UIComponent {
  constructor() {
    super();
    this.element = document.createElement("div");
    this.element.setAttribute("class", "tabs");
    this.checkboxId = 0;
  }

  addItem({name, item}) {
      /**
       * <div class="tab">
       *    <input type="checkbox" class="tab-input" id="check-0"></input>
       *    <label class="tab-label" for="check-0"></label>
       *    <div class="tab-content">
       *        {...content}
       *    </div>
       * </div> 
       */
      // wrapper div
      const newItem = document.createElement("div");
      newItem.setAttribute("class", "tab");
      // input
      const input = document.createElement("input");
      input.setAttribute("type", "checkbox");
      input.setAttribute("class", "tab-input");
      const inputId = this._registerCheckboxId();
      input.setAttribute("id", inputId);
      // label
      const label = document.createElement("label");
      label.setAttribute("class", "tab-label f6");
      label.setAttribute("for", inputId);
      label.innerHTML = name;
      // content div
      const contentDiv = document.createElement("div");
      contentDiv.setAttribute("class", "tab-content");
      contentDiv.appendChild(item);
      // put everything together
      newItem.appendChild(input);
      newItem.appendChild(label);
      newItem.appendChild(contentDiv);
      // add to parent
      this.element.appendChild(newItem);
  }

  _registerCheckboxId() {
      const currId = this.checkboxId;
      this.checkboxId++;
      return `check-${currId}`;
  }

}

export default Accordion;
