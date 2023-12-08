import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as dialogStyle from "/styles/components/welcome-dialog.styl?inline";

class WelcomeDialog extends LitElement {
    static properties = {
        title: { type: String }
    };

    render() {
        return html`
            <ui-dialog title="${this.title}">
                <div id="dialogContent">
                    <div id="leftpanel">
                        <div id="blipicon">${this.blipboxes}</div>
                        <h1>blip—\ngrid</h1>
                        <div id="version">
                            v0.3.5
                        </div>
                        <div id="description">
                            blipgrid is a unique web-app music sequencer and composition tool
                        </div>

                        <div id="leftbuttons">
                            <button>
                                <span class="material-icons">help</span> user guide
                            </button>
                            <button>
                                <span class="material-icons">open_in_new</span> code repository
                            </button>
                            <button>
                                <span class="material-icons">open_in_new</span> visit argarak.me
                            </button>
                        </div>
                    </div>
                    <div id="mainpanel">
                        content go here
                    </div>
                </div>
            </ui-dialog>`;
    }

    static styles = [
        css`${unsafeCSS(mdiStyle.default)}`,
        css`${unsafeCSS(dialogStyle.default)}`
    ];

    updateIcon() {
        let binaryString = this.iconText.charCodeAt(this.iconCounter).toString(2);
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

    constructor() {
        super();
        this.title = "welcome to blipgrid!";
        this.blipboxes = this.populateGrid();

        this.iconText = "blipgrid";
        this.iconCounter = 0;
        this.iconInterval = window.setInterval(() => this.updateIcon(), 1000);
        //this.updateIcon();
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
