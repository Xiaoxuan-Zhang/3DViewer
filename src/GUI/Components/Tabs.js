import UIComponent from "src/GUI/Components/UIComponent.js";

class Tabs extends UIComponent {
    constructor(id, items, selected=null) {
        super();
        const wrapperDiv = document.createElement("div");
        wrapperDiv.id = id;
        const selector = document.createElement("select");
        selector.id = `selector-${id}`;
        selector.className = "f7 link dim br2 ph2 pv1 mb2 dib white bg-mid-gray";
        items.forEach( item => {
            const option = document.createElement("option");
            const { title } = item;
            option.value = title.toLowerCase();
            option.innerText = title;
            selector.appendChild(option);
        })
        if (selected) {
            selector.value = selected.toLowerCase();
        }
        wrapperDiv.appendChild(selector);
        
        items.forEach( item => {
            let visible = selected === item.title ? true : false;
            wrapperDiv.appendChild(this._createContent(item, visible));
            visible = false;
        })
        selector.addEventListener("change", e => {
            const ele = document.getElementById(selector.id);
            if (ele) {
                const nodes = wrapperDiv.querySelectorAll(".tab-content-wrapper");
                nodes.forEach( node => {
                    if (node.id === `content-${ele.value}`) {
                        node.style.display = "block";
                    } else {
                        node.style.display = "none";
                    }
                })
            }
        })
        this.element = wrapperDiv;
    }

    _createContent(item, visible) {
        const contentDiv = document.createElement("div");
        contentDiv.id = `content-${item.title.toLowerCase()}`;
        contentDiv.className = "tab-content-wrapper";
        contentDiv.style.display = visible ? "block" : "none";
        contentDiv.appendChild(item.content);
        return contentDiv;
    }
}

export default Tabs;