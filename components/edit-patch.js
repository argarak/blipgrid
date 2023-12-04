import * as moduleControls from "/objects/module-controls.json";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as editPatchStyle from "/styles/components/edit-patch.styl?inline";
import { LitElement, html, css, unsafeCSS } from "lit";

class EditPatch extends LitElement {
    static properties = {};

    render() {
        return html`
        <div id="loadControls">
          <div id="patchUpload">
            <button id="patchUploadBtn" class="btn">
              <span class="material-icons">upload</span>load patch
            </button>
          </div>
          <div id="patchName"></div>
        </div>
        <div id="patchControls">
           ${this.controls}
        </div>`;
    }

    static styles = [
        css`${unsafeCSS(mdiStyle.default)}`,
        css`${unsafeCSS(editPatchStyle.default)}`
    ];

    constructor() {
        super();
        this.patch = null;
        this.controls = this.drawControls();
    }

    registerTrack(track) {
        if (!track.patch) return;
        this.patch = track.patch;
        this.controls = this.drawControls();
        this.requestUpdate();
    }

    _onControlInput(e, module, control) {
        let target = e.target;
        if (typeof module[control.property] === "object") {
            module[control.property].value = target.value;
            return;
        }
        module[control.property] = target.value;
    }

    getControlValue(module, control) {
        if (typeof module[control.property] === "object") {
            return module[control.property].value;
        }
        return module[control.property];
    }

    createControlElement(module, control) {
        if (control.type == "knob") {
            let knob = document.createElement("ui-knob");
            knob.setAttribute("min", control.min);
            knob.setAttribute("max", control.max);
            knob.setAttribute("default", this.getControlValue(module, control));
            knob.setAttribute("label", control.label);

            knob.addEventListener("input", e =>
                this._onControlInput(e, module, control));

            return knob;
        }

        if (control.type == "select") {
            let select = document.createElement("select");

            for (let option of control.select) {
                let optionElement = document.createElement("option");
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            }

            select.value = this.getControlValue(module, control);

            select.addEventListener("input", e =>
                this._onControlInput(e, module, control));

            return select;
        }
    }

    drawControls() {
        if (!this.patch) return;
        let controlElements = [];

        let index = 0;
        for (let module of this.patch.modules) {
            let moduleName = module.name;

            let groupLabel = document.createElement("label");
            groupLabel.setAttribute("for", `knobsGroup${index}`);
            groupLabel.innerText = moduleName;

            let knobsGroup = document.createElement("div");
            knobsGroup.id = `knobsGroup${index}`;
            knobsGroup.classList.add("knobSet");

            knobsGroup.appendChild(groupLabel);

            let controls = moduleName in moduleControls ?
                moduleControls[moduleName] : [];

            for (let control of controls) {
                knobsGroup.appendChild(
                    this.createControlElement(module, control)
                );
            }

            controlElements.push(knobsGroup);
            index++;
        }

        return controlElements;
    }
}

customElements.define("ui-edit-patch", EditPatch);
export default EditPatch;
