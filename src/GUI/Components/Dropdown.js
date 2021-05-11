import UIComponent from "src/GUI/Components/UIComponent.js";

class Dropdown extends UIComponent {
    constructor(id, title, items) {
        super();
        const wrapperDiv = document.createElement("div");
        wrapperDiv.id = id;
        const label = document.createElement("label");
        label.setAttribute("for", `selector-${id}`);
        label.setAttribute("class", "white mr2 f7");
        label.innerText = title;
        wrapperDiv.appendChild(label);
        const selector = document.createElement("select");
        selector.id = `selector-${id}`;
        selector.className = "f7 link dim br2 ph2 pv1 mb1 mt1 dib white bg-mid-gray";
        items.forEach( item => {
          const option = document.createElement("option");
          option.value = item.toLowerCase();
          option.innerText = item;
          selector.appendChild(option);
        })
        wrapperDiv.appendChild(selector);
        this.element = wrapperDiv;
    }
}

export default Dropdown;