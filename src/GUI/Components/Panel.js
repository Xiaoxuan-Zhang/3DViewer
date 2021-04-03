function Panel(parentElement, divId, title, content) {
  const panel = document.createElement("div");
  panel.id = divId;
  panel.className = "panel-container";
  const controlBtn = document.createElement("button");
  controlBtn.id = "scene-panel-btn";
  controlBtn.className = "panel collapsible";
  controlBtn.innerHTML = title;
  const controlDiv = document.createElement("div");
  controlDiv.id = `${divId}-content`;
  controlDiv.className = "panel-content";
  controlDiv.innerHTML = content;
  panel.appendChild(controlBtn);
  panel.appendChild(controlDiv);
  parentElement.appendChild(panel);
  controlBtn.addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  })
  return panel;
}

export default Panel;
