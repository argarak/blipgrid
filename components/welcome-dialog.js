import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as dialogStyle from "/styles/components/welcome-dialog.styl?inline";
import * as themes from "/objects/themes.json";

import * as packageMeta from "/package.json";

import State from "/scripts/state";
import localforage from "localforage";

import SaveManager from "/scripts/save-manager";

class WelcomeDialog extends LitElement {
    dialog = createRef();

    static properties = {
        title: { type: String },
        selectedTheme: { type: String },
    };

    _onUploadClick(e) {
        e.target.blur();
        SaveManager.uploadProject();
        this.close();
    }

    render() {
        const leftpanel = html`
            <div id="blipicon">${this.blipboxes}</div>
            <h1>blip— grid</h1>
            <div id="version">${packageMeta.version}</div>
            <div id="description">
                blipgrid is a unique web-app music sequencer and composition
                tool
            </div>

            <div id="leftbuttons">
                <button>
                    <span class="material-icons">info</span> user guide
                </button>
                <a href="${packageMeta.repository}" target="_blank">
                    <button>
                        <span class="material-icons">open_in_new</span> code
                        repository
                    </button>
                </a>
                <a href="https://argarak.me" target="_blank">
                    <button>
                        <span class="material-icons">open_in_new</span> visit
                        argarak.me
                    </button>
                </a>
            </div>
        `;

        const fileContainer = html`
            <div id="fileContainer">
                <div class="file">
                    <div class="fileActions">
                        <button class="btn">
                            <span class="material-icons">delete</span>
                        </button>
                        <button class="btn">
                            <span class="material-icons">download</span>
                        </button>
                    </div>
                    <div class="fileName">FM Test</div>
                    <div class="fileAuthor">by argarak</div>
                    <div class="fileDateTime">2023/12/08 17:15</div>
                </div>
            </div>
        `;

        const mainpanel = html`
            <div id="themeSelectContainer">
                select theme:::
                <select
                    id="themeSelect"
                    name="theme"
                    @input=${this._onThemeSelect}
                    .value="${this.selectedTheme}"
                >
                    ${this.themeOptions}
                </select>
            </div>
            <div id="projectActions">
                <button @click=${this._onNewClick}>
                    <span class="material-icons">add</span> create new project
                </button>
                <button @click=${this._onUploadClick}>
                    <span class="material-icons">upload</span> upload project
                    file
                </button>
            </div>
            <div id="filePickerContainer">
                <div id="viewTabs">
                    <div class="tab active">saved projects</div>
                    <div class="tab">open example</div>
                </div>

                ${fileContainer}
            </div>
            <div id="lowerActions">
                <button @click=${this.close}>
                    <span class="material-icons">close</span> close
                </button>
            </div>
        `;

        return html` <ui-dialog ${ref(this.dialog)} title="${this.title}">
            <div id="dialogContent">
                <div id="leftpanel">${leftpanel}</div>
                <div id="mainpanel">${mainpanel}</div>
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

    _onNewClick(e) {
        e.target.blur();
        SaveManager.newProject();
        this.close();
    }

    _onThemeSelect(e) {
        let theme = e.target.value;
        State.setTheme(theme);
    }

    close() {
        this.dialog.value.close();
    }

    updateIcon() {
        let binaryString = this.iconText
            .charCodeAt(this.iconCounter)
            .toString(2);
        for (let a = 0; a < this.blipboxes.length; a++) {
            let offset = this.blipboxes.length - binaryString.length;
            if (a < offset) {
                this.blipboxes[a].classList.remove("active");
                continue;
            }

            let binaryIndex = a - offset;
            if (binaryString[binaryIndex] === "1") {
                this.blipboxes[a].classList.add("active");
            } else {
                this.blipboxes[a].classList.remove("active");
            }
        }
        this.iconCounter = (this.iconCounter + 1) % this.iconText.length;
    }

    themeSelectOptions() {
        let options = [];
        for (let theme of Object.keys(themes.default)) {
            let option = document.createElement("option");
            option.value = theme;
            option.textContent = theme;
            options.push(option);
        }
        return options;
    }

    constructor() {
        super();
        this.title = "welcome to blipgrid!";
        this.blipboxes = this.populateGrid();
        this.selectedTheme = "";

        localforage.getItem("theme").then((value) => {
            this.selectedTheme = value;
        });

        this.iconText = "blipgrid";
        this.iconCounter = 0;
        this.iconInterval = window.setInterval(() => this.updateIcon(), 1000);

        this.saveManager = State.saveManager();

        this.themeOptions = this.themeSelectOptions();
    }

    populateGrid() {
        let blipboxes = [];

        for (let noteIndex = 0; noteIndex < 9; noteIndex++) {
            let noteBox = document.createElement("div");
            noteBox.classList.add("blipBox");
            blipboxes.push(noteBox);
        }

        return blipboxes;
    }
}

customElements.define("ui-welcome-dialog", WelcomeDialog);
export default WelcomeDialog;
