import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import * as dialogStyle from "/styles/components/dialog.styl?inline";

class Dialog extends LitElement {
    static properties = {
        title: { type: String },
    };

    _onCloseClick() {
        this.close();
    }

    close() {
        this.remove();
    }

    render() {
        return html` <div id="dialog">
            <div id="header">
                <button @click=${this._onCloseClick}>
                    <span class="material-icons">close</span>
                </button>
                ${this.title}
            </div>
            <div id="body"><slot></slot></div>
        </div>`;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(dialogStyle.default)}
        `,
    ];

    constructor() {
        super();

        this.title = "dialog";
    }
}

customElements.define("ui-dialog", Dialog);
export default Dialog;
