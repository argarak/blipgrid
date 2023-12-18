import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as dialogStyle from "/styles/components/project-settings-dialog.styl?inline";

import State from "/state";
import localforage from "localforage";

class ProjectSettingsDialog extends LitElement {
    dialog = createRef();

    static properties = {
        title: { type: String },
    };

    render() {
        return html` <ui-dialog ${ref(this.dialog)} title="${this.title}">
            <div id="dialogContent">wow!</div>
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
        this.saveManager = State.saveManager();
    }
}

customElements.define("ui-project-settings-dialog", ProjectSettingsDialog);
export default ProjectSettingsDialog;
