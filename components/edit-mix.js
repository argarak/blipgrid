import * as moduleControls from "/objects/module-controls.json";

import util from "../scripts/util";
import ControlUtil from "../scripts/controls";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as editMixStyle from "/styles/components/edit-mix.styl?inline";
import { LitElement, html, css, unsafeCSS } from "lit";

import State from "/scripts/state";

class EditMix extends LitElement {
    render() {
        return html`<div id="mixerControls">${this.controls}</div>`;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(editMixStyle.default)}
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

        this.muteButtons = [];
        this.soloButtons = [];
    }

    createMuteButton(trackIndex) {
        let button = document.createElement("button");
        button.classList.add("muteBtn");
        button.textContent = "M";
        button.addEventListener("click", (e) => {
            this.mixer.toggleMute(trackIndex);
        });
        this.muteButtons.push(button);
        return button;
    }

    createSoloButton(trackIndex) {
        let button = document.createElement("button");
        button.classList.add("soloBtn");
        button.textContent = "S";
        button.addEventListener("click", () =>
            this.mixer.toggleSolo(trackIndex),
        );
        this.soloButtons.push(button);
        return button;
    }

    drawControls() {
        if (!this.mixer) return;
        let controlElements = [];

        this.muteButtons = [];
        this.soloButtons = [];

        let index = 0;
        for (let module of this.mixer.channels) {
            let moduleName = module.name;

            let groupLabel = document.createElement("label");
            groupLabel.setAttribute("for", `knobsGroup${index}`);
            groupLabel.innerText = index + 1;

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

            knobContainer.appendChild(this.createMuteButton(index));
            knobContainer.appendChild(this.createSoloButton(index));

            knobsGroup.appendChild(knobContainer);

            controlElements.push(knobsGroup);
            index++;
        }

        return controlElements;
    }
}

customElements.define("ui-edit-mix", EditMix);
export default EditMix;
