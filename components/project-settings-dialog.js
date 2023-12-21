import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as dialogStyle from "/styles/components/project-settings-dialog.styl?inline";

import * as scales from "/objects/scales.json";

import State from "/state";
import SaveManager from "/save-manager";
import localforage from "localforage";

import { onInputBlur, onInputFocus } from "../keys";

class ProjectSettingsDialog extends LitElement {
    dialog = createRef();

    static properties = {
        title: { type: String },
        projectName: { type: String, state: true },
        author: { type: String, state: true },
        root: { type: Number, state: true },
        scale: { type: Number, state: true },
    };

    _onNameInput(e) {
        this.projectName = e.target.value;
        SaveManager.projectName = e.target.value;

        const inputEvent = new CustomEvent("input", {
            detail: { property: "projectName", value: this.projectName },
        });
        this.dispatchEvent(inputEvent);
    }

    _onAuthorInput(e) {
        this.author = e.target.value;
        SaveManager.author = e.target.value;

        const inputEvent = new CustomEvent("input", {
            detail: { property: "author", value: this.author },
        });
        this.dispatchEvent(inputEvent);
    }

    _onDescriptionInput(e) {
        this.description = e.target.value;
        SaveManager.description = e.target.value;

        const inputEvent = new CustomEvent("input", {
            detail: { property: "description", value: this.description },
        });
        this.dispatchEvent(inputEvent);
    }

    _onRootSelectInput(e) {
        if (!this.arpeggiator) return;
        this.root = parseInt(e.target.value);
        this.arpeggiator.applyScale(
            scales.roots[this.root],
            scales.scales[this.scale],
        );
    }

    _onScaleSelectInput(e) {
        if (!this.arpeggiator) return;
        this.scale = parseInt(e.target.value);
        this.arpeggiator.applyScale(
            scales.roots[this.root],
            scales.scales[this.scale],
        );
    }

    render() {
        return html` <ui-dialog ${ref(this.dialog)} title="${this.title}">
            <div id="dialogContent">
                <div class="inputContainer">
                    <label for="projectName">project name</label>
                    <input
                        name="projectName"
                        type="text"
                        .value="${this.projectName}"
                        @input=${this._onNameInput}
                        @focus=${onInputFocus}
                        @blur=${onInputBlur}
                    />
                </div>

                <div class="inputContainer">
                    <label for="projectAuthor">author</label>
                    <input
                        name="projectAuthor"
                        type="text"
                        .value="${this.author}"
                        @input=${this._onAuthorInput}
                        @focus=${onInputFocus}
                        @blur=${onInputBlur}
                    />
                </div>

                <div class="inputContainer">
                    <label for="description">description</label>
                    <textarea
                        cols="40"
                        id=""
                        name="descrption"
                        rows="10"
                        .value=${this.description}
                        @input=${this._onDescriptionInput}
                        @focus=${onInputFocus}
                        @blur=${onInputBlur}
                    ></textarea>
                </div>

                <div class="inputContainer">
                    <label for="scale">scale</label>

                    <div id="scaleContainer">
                        <select
                            name="root"
                            @input=${this._onRootSelectInput}
                            .value=${this.root}
                        >
                            ${this.rootOptions}
                        </select>
                        <select
                            name="scale"
                            @input=${this._onScaleSelectInput}
                            .value=${this.scale}
                        >
                            ${this.scaleOptions}
                        </select>
                    </div>
                </div>

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

    constructor() {
        super();
        this.title = "project settings";
        this.projectName = SaveManager.projectName;
        this.author = SaveManager.author;
        this.description = SaveManager.description;

        this.arpeggiator = State.get("arpeggiator");

        this.root = scales.roots.indexOf(this.arpeggiator.root);
        this.scale = scales.scales.indexOf(this.arpeggiator.scale);

        this.scaleOptions = this.scaleSelectOptions();
        this.rootOptions = this.rootSelectOptions();
    }

    scaleSelectOptions() {
        let options = [];
        for (
            let scaleIndex = 0;
            scaleIndex < scales.scales.length;
            scaleIndex++
        ) {
            let option = document.createElement("option");
            option.value = scaleIndex;
            option.textContent = scales.scales[scaleIndex].name;
            if (scaleIndex === this.scale) option.selected = true;
            options.push(option);
        }
        return options;
    }

    rootSelectOptions() {
        let options = [];
        for (let rootIndex = 0; rootIndex < scales.roots.length; rootIndex++) {
            let option = document.createElement("option");
            option.value = rootIndex;
            option.textContent = scales.roots[rootIndex].name;
            if (rootIndex === this.root) option.selected = true;
            options.push(option);
        }
        return options;
    }
}

customElements.define("ui-project-settings-dialog", ProjectSettingsDialog);
export default ProjectSettingsDialog;
