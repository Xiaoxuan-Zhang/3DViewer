function Sidebar(parentElement, id) {
  const sidebar = document.createElement("div");
  sidebar.id = id;
  sidebar.className = "side-bar-right";
  parentElement.appendChild(sidebar);
  return sidebar;
}

export default Sidebar;
