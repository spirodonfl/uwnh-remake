const boundaryPadding = 0; // this is used for padding the window from the edge of the screen when clamping its position

let zIndex = 1000000; // This is the z-index of the first window. Each window will have a higher z-index than the previous one.
let intances = 0;
let instanceOffset = 12; // This is the offset between the windows when they are initially rendered. It's used to make sure they don't overlap.

/**
 * This is a simple draggable and resizable window component.
 * If you give it a name attribute, it will save its position in local storage, but also make sure it's within the boundaries of the screen when it initially renders.
 * TODO: Save the order of the windows in local storage.
 * TODO: Allow initial size and position to be set via attributes.
 * TODO: Save scroll position.
 */
export class DraggableResizableWindow extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.render();
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;
    this.visible = this.getAttribute("visible") === "false" ? false : true;

    this.container = this.shadowRoot.host;
    this.container.style.zIndex = zIndex++;
    this.container.onmousedown = () => (this.container.style.zIndex = zIndex++);
    this.container.onmouseup = () => this.saveState();
    this.header = this.shadowRoot.getElementById("header");

    this.header.onmousedown = this.startDrag;
    this.restoreState();
    this.clampPositionToWindow(); // Make sure the window is within the boundaries of the screen to avoid confusion
    this.setVisibility(this.visible);
  }

  getStateKey() {
    const name = this.getAttribute("name");
    if (name) {
      return `draggable-state:${name}`;
    }
    return null;
  }

  saveState() {
    const width = this.container.offsetWidth - 4;
    const height = this.container.offsetHeight - 4;

    const positionKey = this.getStateKey();
    if (!positionKey) return;
    localStorage.setItem(
      positionKey,
      JSON.stringify({
        x: this.container.style.top,
        y: this.container.style.left,
        width,
        height,
        visible: this.visible
      })
    );
  }

  restoreState() {
    const stateKey = this.getStateKey();
    if (!stateKey) {
      this.setDefaultPosition();
      return;
    }
    const state = JSON.parse(localStorage.getItem(stateKey));
    if (!state) {
      this.setDefaultPosition();
      return;
    };
    state.x && (this.container.style.top = state.x);
    state.y && (this.container.style.left = state.y);
    state.width && (this.container.style.width = state.width + "px");
    state.height && (this.container.style.height = state.height + "px");
    state.visible && (this.visible = state.visible);
    if (state.visible === false) {
      this.container.style.visibility = "hidden";
    }
  }

  toggleVisibility() {
    this.setVisibility(!this.visible);
  }

  /**
   * @param {boolean} visible 
   */
  setVisibility(visible) {
    this.visible = visible;
    this.container.style.visibility = visible ? "visible": "hidden";
    this.saveState();
  }

  setDefaultPosition() {
    this.container.style.top = `${instanceOffset * intances}px`;
    this.container.style.left = `${instanceOffset * intances}px`;
    intances++;
  }

  clampPositionToWindow() {
    const rect = this.container.getBoundingClientRect();
    const x = parseInt(this.container.style.left);
    const y = parseInt(this.container.style.top);
    const maxX = window.innerWidth - rect.width - boundaryPadding;
    const maxY = window.innerHeight - rect.height - boundaryPadding;
    if (x < boundaryPadding) {
      this.container.style.left = boundaryPadding + "px";
    }
    if (y < boundaryPadding) {
      this.container.style.top = boundaryPadding + "px";
    }
    if (x > maxX) {
      this.container.style.left = maxX + "px";
    }
    if (y > maxY) {
      this.container.style.top = maxY + "px";
    }
  }

  startDrag = (e) => {
    e.preventDefault();
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    document.addEventListener("mousemove", this.drag);
    document.addEventListener("mouseup", this.endDrag);
  };

  drag = (e) => {
    e.preventDefault();
    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    this.container.style.top = this.container.offsetTop - this.pos2 + "px";
    this.container.style.left = this.container.offsetLeft - this.pos1 + "px";
  };

  endDrag = (e) => {
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("mouseup", this.endDrag);
    this.saveState();
  };

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
            display:flex;
            flex-direction: column;
            position: absolute;
            width: 300px;
            height: 300px;
            resize: both;
            overflow: auto;
            border: 2px solid orange;
            color: white;
            background-color: rgba(0, 0, 0, 0.9);
            border-radius: 5px;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        #header {
            position: sticky;
            top: 0;
            left: 0;
            z-index: 100;
            flex: none;
            width: 100%;
            height: 1em;
            background-color: orange;
            cursor: move;
        }
        #content {
            width: 100%;
            position: relative;
            display: flex;
            flex: 1;
            flex-direction: column;
        }
      </style>
      <div id="header"></div>
      <div id="content">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define("x-draggable", DraggableResizableWindow);
