import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import * as sequencerStyle from "/styles/sequencer.styl?inline";
import defaultAlgorithms from "../sequence-algorithms.js";
import util from "../util.js";

/**
 * sequencer web component
 * creates a sequencer which consists of
 * - a grid of triggers (by default 64)
 * - a select element to choose the algorithm used to generate the sequence
 * - an input element to change the number of steps the sequencer has
 * - a set of controls to manipulate the sequence algorithm
 */
class Arpeggiator extends LitElement {
    triggerGrid = createRef();

    static properties = {
        selectedAlgorithm: { type: Number, state: true },
        selectedTrack: { type: Number, state: true }
    };

    _onAlgorithmSelectInput(e) {
        let algorithm = null;
        for (algorithm of this.algorithms) {
            if (parseInt(e.target.value) ===
                util.hashCode(algorithm.fn.toString())) {
                break;
            }
            // TODO: error if not found
        }

        this.sequence[this.selectedTrack].algorithm = algorithm;
    }

    _onStepsInput(e) {
        this.sequenceLength = e.target.value;
    }

    _onControlInput(e, modIndex) {
        this.sequence[this.selectedTrack].mod[modIndex] = e.target.value;
        this.sequence[this.selectedTrack].sequence = this.generateSequence();
        this.triggerGrid.value.sequence = this.sequence[this.selectedTrack].sequence;
    }

    render() {

        const algorithmOptions = this.algorithmSelectOptions();
        const algorithmControls = this.algorithmControls();
        return html`
            <select id="algorithmSelect" @input=${this._onAlgorithmSelectInput}
                    value="${this.selectedAlgorithm}">
                ${algorithmOptions}
            </select>
            <div id="knobContainer">${algorithmControls}</div>
        `;
    }

    static styles = css`${unsafeCSS(sequencerStyle.default)}`;

    constructor() {
        super();

        this.numTracks = 8;
        this.selectedTrack = 0;

        // all algorithms registered by this sequencer
        this.algorithms = defaultAlgorithms;

        // holds list of notebox DOM elements
        this.noteboxes = [];

        // holds currently programmed sequencer
        this.sequence = {};

        let defaultLength = 64;

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            this.sequence[trackIndex] = {
                mod: [],
                patch: null,
                length: defaultLength,
                sequence: [],
                algorithm: this.algorithms[0]
            };
        }

        this.selectedAlgorithm =
            util.hashCode(this.sequence[this.selectedTrack].algorithm.fn.toString());

        this.sequenceLength = defaultLength;

        // keeps track of the current step position
        // initially at the end of the sequence so that the sequence can start
        // at step zero when the first next() method is called
        this.step = this.sequenceLength;

        this.switchTrack(0);
    }

    assignPatch(trackIndex, patch) {
        this.sequence[trackIndex].patch = patch;
    }

    getCurrentTrack() {
        return this.sequence[this.selectedTrack];
    }

    switchTrack(trackIndex) {
        this.selectedTrack = trackIndex;

        const switchTrackEvent = new CustomEvent("trackSwitch", {
            detail: this.sequence[this.selectedTrack]
        });

        if ("value" in this.triggerGrid) {
            this.triggerGrid.value.sequence = this.sequence[this.selectedTrack].sequence;
        }

        this.selectedAlgorithm =
            util.hashCode(this.sequence[this.selectedTrack].algorithm.fn.toString());
        document.dispatchEvent(switchTrackEvent);
    }

    nextStep() {
        this.step += 1;
    }

    /**
     * increments the sequencer, looping back to the start if necessary
     * @return whether the next step is active or inactive
     **/
    next(trackIndex) {
        let length = this.sequence[trackIndex].length;

        if (this.selectedTrack === trackIndex) {
            this.triggerGrid.value.setStep(this.step % length);
        }

        return this.sequence[trackIndex % this.numTracks].sequence[this.step % length];
    }

    registerAlgorithm(name, fn) {
        this.algorithms.push({
            "name": name,
            "fn": fn
        });
    }


    algorithmControls() {
        let knobs = [];

        const algoMods = this.sequence[this.selectedTrack].algorithm.mods;

        for (let modIndex = 0; modIndex < algoMods.length; modIndex++) {
            let knob = document.createElement("ui-knob");
            knob.setAttribute("min", 0);
            knob.setAttribute("max", 64);

            let currentMod = this.sequence[this.selectedTrack].mod[modIndex];

            knob.setAttribute("default", currentMod ? currentMod : 0);
            knob.setAttribute(
                "label", algoMods[modIndex].name
            );

            knob.setAttribute(
                "integer-mode",
                algoMods[modIndex].integerMode
            );

            knob.addEventListener("input", e =>
                this._onControlInput(e, modIndex));

            knobs.push(knob);
        }

        return knobs;
    }

    algorithmSelectOptions() {
        let options = [];
        for (let alIndex = 0; alIndex < this.algorithms.length; alIndex++) {
            let optionElement = document.createElement("option");
            optionElement.value = util.hashCode(this.algorithms[alIndex].fn.toString());
            optionElement.textContent = this.algorithms[alIndex].name;
            options.push(optionElement);
        }
        return options;
    }

    generateSequence() {
        let sequence = [];
        for (let index = 0; index < this.sequenceLength; index++) {
            sequence.push(
                this.sequence[this.selectedTrack]
                    .algorithm.fn(index,
                        this.sequence[this.selectedTrack].length,
                        this.sequence[this.selectedTrack].mod)
            );
        }
        return sequence;
    }
}

customElements.define("ui-arpeggiator", Arpeggiator);

export default Arpeggiator;
