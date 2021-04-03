function TextEditor(parentElement, id, textObj) {
    const editor = document.createElement("div");
    editor.id = id;
    editor.className = "text-editor";
    editor.contentEditable = true;
    editor.innerHTML = textObj
    parentElement.appendChild(editor);
    return editor;
}

export default TextEditor;
  