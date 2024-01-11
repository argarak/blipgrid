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
        return html`<div>edit effect!</div>`;
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

customElements.define("ui-edit-effect", EditEffect);
export default EditEffect;
