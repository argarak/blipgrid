import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as dialogStyle from "/styles/components/project-settings-dialog.styl?inline";

import * as scales from "/objects/scales.json";

import State from "/state";
import SaveManager from "/save-manager";
import localforage from "localforage";

class ProjectSettingsDialog extends LitElement {
    dialog = createRef();

    static properties = {
        title: { type: String },
        projectName: { type: String, state: true },
        author: { type: String, state: true },
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
                    />
                </div>

                <div class="inputContainer">
                    <label for="projectAuthor">author</label>
                    <input
                        name="projectAuthor"
                        type="text"
                        .value="${this.author}"
                        @input=${this._onAuthorInput}
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
                    ></textarea>
                </div>

                <div class="inputContainer">
                    <label for="scale">scale</label>

                    <div id="scaleContainer">
                        <select name="root">
                            ${this.rootOptions}
                        </select>
                        <select name="scale">
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

        this.scaleOptions = this.scaleSelectOptions();
        this.rootOptions = this.rootSelectOptions();
    }

    scaleSelectOptions() {
        let options = [];
        for (let scale of Object.keys(scales.default)) {
            let option = document.createElement("option");
            option.value = scale;
            option.textContent = scale;
            options.push(option);
        }
        return options;
    }

    rootSelectOptions() {
        let options = [];
        for (let note of [
            "C",
            "C#",
            "D",
            "D#",
            "E",
            "F",
            "F#",
            "G",
            "G#",
            "A",
            "A#",
            "B",
        ]) {
            let option = document.createElement("option");
            option.value = note;
            option.textContent = note;
            options.push(option);
        }
        return options;
    }
}

customElements.define("ui-project-settings-dialog", ProjectSettingsDialog);
export default ProjectSettingsDialog;
