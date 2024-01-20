import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as dialogStyle from "/styles/components/preset-dialog.styl?inline";

import * as presets from "/objects/presets.json";
import * as basicPatch from "/objects/patches/basic.json";
import * as basicSynthPatch from "/objects/patches/basic-synth.json";

class PresetDialog extends LitElement {
    dialog = createRef();

    static properties = {
        title: { type: String },
    };

    render() {
        return html` <ui-dialog ${ref(this.dialog)} title="${this.title}">
            <div id="dialogContent">
                ${this.presetMenu}

                <div id="lowerActions">
                    <button @click=${this.close}>
                        <span class="material-icons">close</span> close
                    </button>
                </div>
            </div>
        </ui-dialog>`;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(dialogStyle.default)}
        `,
    ];

    close() {
        this.dialog.value.close();
    }

    generatePresetMenu() {
        let patchCategories = [];
        for (let cat of Object.keys(presets.default)) {
            let catElement = document.createElement("div");
            catElement.classList.add("presetCat");
            let catLabel = document.createElement("div");
            catLabel.classList.add("catLabel");

            catLabel.innerText = cat;
            catElement.appendChild(catLabel);

            for (let patch of presets.default[cat]) {
                let patchButton = document.createElement("button");
                patchButton.classList.add("presetBtn");
                patchButton.innerText = patch.name;
                catElement.appendChild(patchButton);
            }

            patchCategories.push(catElement);
        }
        return patchCategories;
    }

    constructor() {
        super();
        this.title = "preset menu";
        this.presetMenu = this.generatePresetMenu();
    }
}

customElements.define("ui-preset-dialog", PresetDialog);
export default PresetDialog;
