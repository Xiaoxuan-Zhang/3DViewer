import UIComponent from "src/GUI/Components/UIComponent.js";

class FileUploader extends UIComponent {
    constructor(id, title) {
        super();
        const element = document.createElement("div");
        element.id = id;
        element.innerHTML = `
            <label for="btn-${id}" class="f7 mr2 white">${title}</label>
            <a 
                id="btn-${id}" 
                onclick=document.getElementById("input-${id}").click()
                class="f7 link dim br2 ph2 pv1 mb2 dib white bg-mid-gray"
                style="cursor:pointer"
            >
                <i class="fas fa-file-upload"></i>
            </a>
            <input id="input-${id}" type="file" accept=".obj" name="model" style="display:none"></input>
        `;
        this.id = id;
        this.element = element;
    }

    bindEvent(target=null, eventType, callback) {
        let targetId = `btn-${this.id}`;
        const ele = this.element.querySelector(targetId);
        if (ele) {
            ele.addEventListener(eventType, e => { 
                callback(e);
            })
        }
    }
}

export default FileUploader;