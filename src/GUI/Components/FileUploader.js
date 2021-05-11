import UIComponent from "src/GUI/Components/UIComponent.js";

class FileUploader extends UIComponent {
    constructor(id, title, accept="*") {
        super();
        const element = document.createElement("div");
        element.id = id;
        element.innerHTML = `
            <label for="btn-${id}" class="f7 mr2 white">${title}</label>
            <a 
                id="btn-${id}" 
                onclick=document.getElementById("input-${id}").click()
                class="f7 link dim br2 ph2 pv1 mb1 mt1 dib white bg-mid-gray"
                style="cursor:pointer"
            >
                <i class="fas fa-file-upload"></i>
            </a>
            <input id="input-${id}" type="file" accept="${accept}" name="model" style="display:none"></input>
        `;
        const fileName = document.createElement("span");
        fileName.id = "filename";
        element.appendChild(fileName);
        this.id = id;
        this.element = element;
        this.fileName = fileName;
    }

    bindEvent(target=null, eventType, callback) {
        const ele = this.element.querySelector("input");
        if (ele) {
            ele.addEventListener(eventType, e => { 
                e.stopPropagation();
                e.preventDefault();
                const file = e.target.files[0];
                this.fileName.innerText = file.name;
                callback(file);
            })
        }
    }
}

export default FileUploader;