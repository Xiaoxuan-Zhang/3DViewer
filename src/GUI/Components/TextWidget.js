import UIComponent from "src/GUI/Components/UIComponent.js";

class TextEditor extends UIComponent {
    constructor(id, title, text) {
        super();
        this.id = id;
        this.textAreaId = `textarea-${id}`;
        this.submitId = `submit-${id}`;
        const editor = document.createElement("div");
        editor.setAttribute("id", `editor-${id}`);
        editor.setAttribute("class", "text-editor");
        editor.innerHTML = `
            <form class="black-80">
                <div content-editable>
                    <label for="${id}" class="f6 b db mb2">${title}</label>
                    <textarea id=${this.textAreaId} name="${id}" class="textbox lh-copy db border-box hover-black w-100 ba b--black-20 pa2 br2 mb2 f6" aria-describedby="${title}-desc">
                        ${text}
                    </textarea>
                </div>
            </form>
            <a id=${this.submitId} class="f6 link dim br3 ph3 pv2 mb2 dib white bg-dark-green" href="#">Save</>
        `;
        this.element = editor;
    }

    getTextAreaId() {
        return this.textAreaId;
    }
    
    getSubmitId() {
        return this.submitId;
    }

    bindEvent(target, eventType, callback) {
        let targetId = "";
        switch(target) {
            case "textarea":
                targetId = this.textAreaId;
                break;
            case "submit":
                targetId = this.submitId;
                break;
            default:
                console.log("Invalid target");
                targetId = "";
                break;
        }
        const ele = document.getElementById(targetId);
        if (ele) {
            ele.addEventListener(eventType, e => { 
                callback(e);
            })
        }
    }
}

export default TextEditor;
  