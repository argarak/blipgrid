import * as moduleControls from "/objects/module-controls.json";

import util from "../scripts/util";
import ControlUtil from "../scripts/controls";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as editEffectStyle from "/styles/components/edit-effect.styl?inline";
import { LitElement, html, css, unsafeCSS } from "lit";

import State from "/scripts/state";

class EditMix extends LitElement {
    render() {
        return html`edit mix!`;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(editEffectStyle.default)}
        `,
    ];

    constructor() {
        super();
        this.mixer = State.mixer();
    }
}

customElements.define("ui-edit-mix", EditMix);
export default EditMix;
