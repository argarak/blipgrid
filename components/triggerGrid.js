import { LitElement, html, css, unsafeCSS } from "lit";
import * as triggerGridStyle from "/styles/triggerGrid.styl?inline";

class TriggerGrid extends LitElement {
    static properties = {
        sequence: { type: Array, hasChanged: this._onSequenceChanged },
        length: { type: Number },
        step: { type: Number }
    };

    set sequence(s) {
        if (s === null) return;
        if (s.length === 0) {
            this.noteboxes.forEach(n => n.classList.remove("active"));
            return;
        }
        for (let noteIndex = 0; noteIndex < s.length; noteIndex++) {
            let noteBox = this.noteboxes[noteIndex];

            if (s[noteIndex]) {
                noteBox.classList.add("active");
            }
            else noteBox.classList.remove("active");
        }
    }

    render() {
        return html`${this.noteboxes}`;
    }

    static styles = css`${unsafeCSS(triggerGridStyle.default)}`;

    constructor() {
        super();
        this.length = 64;
        this.step = this.length;

        this.noteboxes = this.populateGrid();
        this.sequence = new Array(this.length);
    }

    setStep(s) {
        for (let noteIndex = 0; noteIndex < this.noteboxes.length; noteIndex++) {
            let noteBox = this.noteboxes[noteIndex];

            if (noteIndex === s) {
                noteBox.classList.add("marker");
                noteBox.scrollIntoView();
            }
            else noteBox.classList.remove("marker");
        }
        this.step = s;
    }

    populateGrid() {
        let noteboxes = [];

        for (let noteIndex = 0; noteIndex < this.length; noteIndex++) {
            let noteBox = document.createElement("div");
            noteBox.classList.add("noteBox");
            noteboxes.push(noteBox);
        }

        return noteboxes;
    }
}

customElements.define("ui-trigger-grid", TriggerGrid);
export default TriggerGrid;
