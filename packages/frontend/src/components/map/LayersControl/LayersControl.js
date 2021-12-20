class LayersControl {
  onAdd() {
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    const icon = document.createElement("button");
    icon.className = "material-icons";
    icon.style.verticalAlign = "middle";
    icon.style.cursor = "pointer";
    icon.textContent = "layers";
    this._container.appendChild(icon);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
  }
}

export default LayersControl;
