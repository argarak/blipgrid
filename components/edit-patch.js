import * as moduleControls from "/objects/module-controls.json";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as editPatchStyle from "/styles/components/edit-patch.styl?inline";
import { LitElement, html, css, unsafeCSS } from "lit";

import State from "/scripts/state";
import ControlUtil from "../scripts/controls";

class EditPatch extends LitElement {
    static properties = {
        name: { type: String, state: true },
    };

    render() {
        return html` <div id="loadControls">
                <div id="patchUpload">
                    <button id="patchUploadBtn" class="btn">
                        <span class="material-icons">
                            settings_input_component</span
                        >
                        select preset
                    </button>
                </div>
                <div id="patchName">${this.name}</div>
            </div>
            <div id="patchControls">${this.controls}</div>
            <div id="effectControlContainer">
                <h3 id="effectTitle">
                    <span class="material-icons">send</span> fx send
                </h3>
                <div id="effectControls">${this.effectControls}</div>
            </div>`;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(editPatchStyle.default)}
        `,
    ];

    constructor() {
        super();
        this.track = null;
        this.patch = null;
        this.mixer = State.mixer();
        this.controls = this.drawControls();
        this.effectControls = this.drawEffectControls();

        this.name = "";
    }

    registerTrack(track) {
        if (!track.patch) return;
        this.track = track;
        this.patch = track.patch;
        this.name = track.patch.name;
        this.controls = this.drawControls();
        this.effectControls = this.drawEffectControls();
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

    _onSendInput(e, effect) {
        if (!this.track) return;
        if (!this.mixer) return;
        let value = e.target.value;
        this.mixer.effectSends[this.track.index][effect.name].set({
            gain: value,
        });
    }

    drawEffectControls() {
        if (!this.patch) return;
        let knobs = [];

        const effectChannels = this.patch.mixer.effectChannels;

        for (
            let effectIndex = 0;
            effectIndex < effectChannels.length;
            effectIndex++
        ) {
            let knob = document.createElement("ui-knob");

            let min = -80;
            let max = 0;
            knob.setAttribute("min", min);
            knob.setAttribute("max", max);

            knob.setAttribute(
                "default",
                this.mixer.effectSends[this.track.index][
                    effectChannels[effectIndex].name
                ].gain.value,
            );
            knob.setAttribute("label", effectChannels[effectIndex].name);
            knob.setAttribute("nonlinear", true);

            knob.addEventListener("input", (e) =>
                this._onSendInput(e, effectChannels[effectIndex]),
            );

            knobs.push(knob);
        }

        return knobs;
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

            let controls =
                moduleName in moduleControls ? moduleControls[moduleName] : [];

            for (let control of controls) {
                knobsGroup.appendChild(
                    ControlUtil.createControlElement(
                        module,
                        control,
                        this._onControlInput,
                    ),
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
