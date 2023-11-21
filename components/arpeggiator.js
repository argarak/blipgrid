import * as Tone from "tone";
import { LitElement, html, css, unsafeCSS } from "lit";

import * as arpeggiatorStyle from "/styles/arpeggiator.styl?inline";
import defaultAlgorithms from "../arpeggiator-algorithms.js";
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
        this.selectedAlgorithm =
            util.hashCode(this.sequence[this.selectedTrack].algorithm.fn.toString());
    }

    _onControlInput(e, modIndex) {
        this.sequence[this.selectedTrack].mod[modIndex] = e.target.value;
    }

    render() {
        const algorithmOptions = this.algorithmSelectOptions();
        const algorithmControls = this.algorithmControls();

        const octaveIndicators = this.generateIndicators(this.octaves);

        return html`
            <select id="algorithmSelect" @input=${this._onAlgorithmSelectInput}
                    value="${this.selectedAlgorithm}">
                ${algorithmOptions}
            </select>
            <div id="octaveIndicatorContainer">${octaveIndicators}</div>
            <div id="noteIndicatorContainer">${this.noteIndicators}</div>
            <div id="knobContainer">${algorithmControls}</div>
        `;
    }

    generateIndicators(length) {
        let indicators = [];

        for (let noteIndex = 0; noteIndex < length; noteIndex++) {
            let indicator = document.createElement("div");
            indicator.classList.add("indicator");
            indicators.push(indicator);
        }

        return indicators;
    }

    static styles = css`${unsafeCSS(arpeggiatorStyle.default)}`;

    constructor() {
        super();

        this.numTracks = 8;
        this.selectedTrack = 0;

        // all algorithms registered by this sequencer
        this.algorithms = defaultAlgorithms;

        // holds list of notebox DOM elements
        this.noteboxes = [];

        this.root = "F3";
        this.scale = [0, 2, 3, 5, 7, 8, 10];

        // holds currently programmed sequencer
        this.sequence = {};

        this.notesPerOctave = 12;
        this.octaves = 5;

        this.noteIndicators = this.generateIndicators(this.notesPerOctave);

        let defaultLength = 64;

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            this.sequence[trackIndex] = {
                mod: [],
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

    switchTrack(trackIndex) {
        this.selectedTrack = trackIndex;
        this.selectedAlgorithm =
            util.hashCode(this.sequence[this.selectedTrack].algorithm.fn.toString());
    }

    updateNoteIndicators(noteIndex) {
        for (let indicatorIndex = 0;
            indicatorIndex < this.noteIndicators.length;
            indicatorIndex++) {
            let indicator = this.noteIndicators[indicatorIndex];
            if (indicatorIndex === noteIndex) indicator.classList.add("active");
            else indicator.classList.remove("active");
        }
    }

    /**
     * increments the sequencer, looping back to the start if necessary
     * @return whether the next step is active or inactive
     **/
    next(trackIndex, t) {
        let selected = this.sequence[trackIndex].algorithm.fn(t,
            this.scale,
            this.sequence[trackIndex].mod);
        let notes = Tone.Frequency(this.root).harmonize(this.scale);
        if (this.selectedTrack === trackIndex) {
            this.updateNoteIndicators(this.scale[selected[0]]);
        }
        return notes[selected[0]];
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
}

customElements.define("ui-arpeggiator", Arpeggiator);

export default Arpeggiator;
