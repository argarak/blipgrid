import * as moduleControls from "/objects/module-controls.json";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as editEffectStyle from "/styles/components/edit-effect.styl?inline";
import { LitElement, html, css, unsafeCSS } from "lit";

import State from "/scripts/state";

class EditEffect extends LitElement {
    static properties = {
        name: { type: String, state: true },
    };

    render() {
        return html`<div id="effectControls">${this.controls}</div>`;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(editEffectStyle.default)}
        `,
    ];

    _onControlInput(e, module, control) {
        let target = e.target;
        if (typeof module[control.property] === "object") {
            module[control.property].value = target.value;
            return;
        }
        module[control.property] = target.value;
    }

    constructor() {
        super();
        this.mixer = State.mixer();
        this.controls = this.drawControls();
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

            if (control.integerMode) knob.setAttribute("integer-mode", true);
            knob.setAttribute("label", control.label);

            knob.addEventListener("input", (e) =>
                this._onControlInput(e, module, control),
            );

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

            select.addEventListener("input", (e) =>
                this._onControlInput(e, module, control),
            );

            return select;
        }
    }

    drawControls() {
        if (!this.mixer) return;
        let controlElements = [];

        let index = 0;
        for (let module of this.mixer.modules) {
            let moduleName = module.name;

            let groupLabel = document.createElement("label");
            groupLabel.setAttribute("for", `knobsGroup${index}`);
            groupLabel.innerText = moduleName;

            let knobsGroup = document.createElement("div");
            knobsGroup.id = `knobsGroup${index}`;
            knobsGroup.classList.add("knobSet");

            knobsGroup.appendChild(groupLabel);

            let knobContainer = document.createElement("div");
            knobContainer.classList.add("knobContainer");

            let controls =
                moduleName in moduleControls ? moduleControls[moduleName] : [];

            for (let control of controls) {
                knobContainer.appendChild(
                    this.createControlElement(module, control),
                );
            }

            knobsGroup.appendChild(knobContainer);

            controlElements.push(knobsGroup);
            index++;
        }

        return controlElements;
    }
}

customElements.define("ui-edit-effect", EditEffect);
export default EditEffect;
