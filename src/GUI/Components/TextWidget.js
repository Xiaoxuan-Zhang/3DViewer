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
                    <textarea id=${this.textAreaId} name="${id}" class="textbox lh-copy db border-box hover-white w-100 ba pa2 br2 mb2 f6" aria-describedby="${title}-desc">
                        ${text}
                    </textarea>
                </div>
            </form>
            <a id=${this.submitId} class="f7 link dim br1 ph3 pv2 mb2 mt2 dib white bg-dark-green" href="#">Update</>
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
  