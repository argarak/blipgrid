import * as moduleControls from "/objects/module-controls.json";

import util from "../scripts/util";
import ControlUtil from "../scripts/controls";

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

        clearTimeout(target.timer);
        target.timer = setTimeout(() => {
            if (typeof module[control.property] === "object") {
                module[control.property].value = target.value;
                return;
            }
            module[control.property] = target.value;
        }, 250);
    }

    constructor() {
        super();
        this.mixer = State.mixer();
        this.controls = this.drawControls();
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
                    ControlUtil.createControlElement(
                        module,
                        control,
                        this._onControlInput,
                    ),
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
