import UIComponent from "src/GUI/Components/UIComponent.js";

class Card extends UIComponent {
    constructor(id, title, content) {
        super();
        const cardDiv = document.createElement("article");
        cardDiv.id = id;
        cardDiv.className = "center mw5 mw6-ns br3 hidden ba b--black-10 mv4";
        cardDiv.innerHTML = `
            <h1 class="f4 bg-near-white br3 br--top black-60 mv0 pv2 ph3">${title}</h1>
        `;
        const contentDiv = document.createElement("div");
        contentDiv.className= "pa3 bt b--black-10";
        contentDiv.appendChild(content);
        cardDiv.appendChild(contentDiv);
        this.element = cardDiv;
    }
}

export default Card;