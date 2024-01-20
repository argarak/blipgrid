import * as Tone from "tone";
import { LitElement, html, css, unsafeCSS } from "lit";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as arpeggiatorStyle from "/styles/components/arpeggiator.styl?inline";
import defaultAlgorithms from "/scripts/arpeggiator-algorithms.js";
import util from "/scripts/util.js";

import * as scales from "/objects/scales.json";

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
        selectedTrack: { type: Number, state: true },
    };

    _onAlgorithmSelectInput(e) {
        let algorithm = null;
        for (algorithm of this.algorithms) {
            if (
                parseInt(e.target.value) ===
                util.hashCode(algorithm.fn.toString())
            ) {
                break;
            }
            // TODO: error if not found
        }

        this.sequence[this.selectedTrack].algorithm = algorithm;
        this.selectedAlgorithm = util.hashCode(
            this.sequence[this.selectedTrack].algorithm.fn.toString(),
        );
    }

    _onControlInput(e, modIndex) {
        this.sequence[this.selectedTrack].mod[modIndex] = e.target.value;
    }

    _onViewTitleClick(e) {
        e.target.classList.toggle("minimise");
    }

    render() {
        const algorithmOptions = this.algorithmSelectOptions();
        const algorithmControls = this.algorithmControls();
        const noteControls = this.noteControls();

        return html`
            <h3 id="viewTitle" @click=${this._onViewTitleClick}>
                <span class="material-icons">music_note</span>
                <span class="text">pitch pattern</span>
            </h3>
            <select
                id="algorithmSelect"
                @input=${this._onAlgorithmSelectInput}
                value="${this.selectedAlgorithm}"
            >
                ${algorithmOptions}
            </select>
            <div id="noteIndicatorContainer">${this.noteIndicators}</div>
            <div id="controlsContainer">${noteControls}</div>
            <hr />
            <div id="knobContainer">${algorithmControls}</div>
        `;
    }

    generateIndicators(length) {
        let indicators = [];

        for (let noteIndex = 0; noteIndex < length; noteIndex++) {
            let indicator = document.createElement("div");
            indicator.classList.add("indicator");

            if (this.allRoots.has(this.noteRange[noteIndex])) {
                indicator.classList.add("root");
            }

            indicators.push(indicator);
        }

        return indicators;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(arpeggiatorStyle.default)}
        `,
    ];

    generateNoteRange(root, scale) {
        let range = [];

        for (let note = this.lowestNote; note < root.note; note++) {
            let rootDivisor = Math.ceil(
                Math.abs((note - root.note) / this.notesPerOctave),
            );

            let octaveRoot = root.note - this.notesPerOctave * rootDivisor;
            this.allRoots.add(octaveRoot);

            let scaleNotes = Tone.Frequency(octaveRoot, "midi").harmonize(
                scale.semitones,
            );

            for (let scaleNote of scaleNotes) {
                let midiNote = scaleNote.toMidi();
                if (midiNote == note) range.push(note);
            }
        }

        for (let note = root.note; note <= this.highestNote; note++) {
            let octaveMultiplier = Math.floor(
                (note - root.note) / this.notesPerOctave,
            );
            let octaveRoot = root.note + 12 * octaveMultiplier;
            this.allRoots.add(octaveRoot);

            let scaleNotes = Tone.Frequency(octaveRoot, "midi").harmonize(
                scale.semitones,
            );

            for (let scaleNote of scaleNotes) {
                let midiNote = scaleNote.toMidi();
                if (midiNote == note) range.push(note);
            }
        }

        return range;
    }

    constructor() {
        super();

        this.numTracks = 8;
        this.selectedTrack = 0;

        // all algorithms registered by this sequencer
        this.algorithms = defaultAlgorithms;

        // holds list of notebox DOM elements
        this.noteboxes = [];

        this.lowestNote = 21;
        this.highestNote = 108;

        this.notesPerOctave = 12;
        this.octaves = 5;

        this.applyScale(scales.roots[0], scales.scales[0]);

        // holds currently programmed sequencer
        this.sequence = {};

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            this.sequence[trackIndex] = {
                mod: [],
                sequence: [],
                algorithm: this.algorithms[0],

                rangeStart: this.lowestNote,
                rangeEnd: this.highestNote,
            };
        }

        this.selectedAlgorithm = util.hashCode(
            this.sequence[this.selectedTrack].algorithm.fn.toString(),
        );

        this.switchTrack(0);
    }

    applyScale(root, scale) {
        this.allRoots = new Set();
        this.root = root;
        this.scale = scale;
        this.noteRange = this.generateNoteRange(this.root, this.scale);
        this.noteIndicators = this.generateIndicators(this.noteRange.length);
        this.requestUpdate();
    }

    saveState() {
        const state = {};

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            let trackState = {};
            let track = this.sequence[trackIndex];

            trackState["mod"] = track["mod"];
            // store algorithm reference
            trackState["algorithm"] = util.hashCode(
                track.algorithm.fn.toString(),
            );

            trackState["rangeStart"] = track["rangeStart"];
            trackState["rangeEnd"] = track["rangeEnd"];

            state[trackIndex] = trackState;
        }

        return state;
    }

    loadState(root, scale, sequence) {
        this.selectedTrack = 0;

        this.allRoots = new Set();
        this.root = root;
        this.scale = scale;
        this.noteRange = this.generateNoteRange(this.root, this.scale);

        // holds currently programmed sequencer
        this.sequence = {};

        this.noteIndicators = this.generateIndicators(this.noteRange.length);

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            let trackAlgorithm = null;
            for (let algorithm of this.algorithms) {
                let hash = util.hashCode(algorithm.fn.toString());
                if (hash === sequence[trackIndex].algorithm) {
                    trackAlgorithm = algorithm;
                    break;
                }
            }

            if (!trackAlgorithm) {
                // TODO error here
            }

            this.sequence[trackIndex] = {
                mod: sequence[trackIndex].mod,
                sequence: [],
                algorithm: trackAlgorithm,

                rangeStart: sequence[trackIndex].rangeStart,
                rangeEnd: sequence[trackIndex].rangeEnd,
            };
        }

        this.selectedAlgorithm = util.hashCode(
            this.sequence[this.selectedTrack].algorithm.fn.toString(),
        );

        this.switchTrack(0);
        this.requestUpdate();
    }

    switchTrack(trackIndex) {
        this.selectedTrack = trackIndex;
        this.selectedAlgorithm = util.hashCode(
            this.sequence[this.selectedTrack].algorithm.fn.toString(),
        );
    }

    updateNoteIndicators(noteIndex) {
        for (
            let indicatorIndex = 0;
            indicatorIndex < this.noteIndicators.length;
            indicatorIndex++
        ) {
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
        let slicedRange = this.noteRange.slice(
            this.sequence[trackIndex].rangeStart,
            this.sequence[trackIndex].rangeEnd,
        );

        let selected = this.sequence[trackIndex].algorithm.fn(
            t,
            slicedRange,
            this.sequence[trackIndex].mod,
        );

        if (this.selectedTrack === trackIndex) {
            this.updateNoteIndicators(
                this.sequence[trackIndex].rangeStart + selected,
            );
        }
        return Tone.Frequency(slicedRange[selected], "midi");
    }

    registerAlgorithm(name, fn) {
        this.algorithms.push({
            name: name,
            fn: fn,
        });
    }

    _onNoteControlInput(e, type) {
        switch (type) {
            case "start":
                this.sequence[this.selectedTrack].rangeStart = e.target.value;
                break;
            case "end":
                this.sequence[this.selectedTrack].rangeEnd = e.target.value;
                break;
        }
    }

    noteControls() {
        let knobs = [];

        let currentStart = this.sequence[this.selectedTrack].rangeStart;
        let currentEnd = this.sequence[this.selectedTrack].rangeEnd;

        let startKnob = document.createElement("ui-knob");
        startKnob.setAttribute("min", 0);
        startKnob.setAttribute("max", this.noteRange.length);
        startKnob.setAttribute("default", currentStart);
        startKnob.setAttribute("label", "start note");
        startKnob.setAttribute("integer-mode", true);
        startKnob.addEventListener("input", (e) =>
            this._onNoteControlInput(e, "start"),
        );
        knobs.push(startKnob);

        let endKnob = document.createElement("ui-knob");
        endKnob.setAttribute("min", 0);
        endKnob.setAttribute("max", this.noteRange.length);
        endKnob.setAttribute("default", currentEnd);
        endKnob.setAttribute("label", "end note");
        endKnob.setAttribute("integer-mode", true);
        endKnob.addEventListener("input", (e) =>
            this._onNoteControlInput(e, "end"),
        );
        knobs.push(endKnob);

        return knobs;
    }

    algorithmControls() {
        let knobs = [];

        const algoMods = this.sequence[this.selectedTrack].algorithm.mods;

        for (let modIndex = 0; modIndex < algoMods.length; modIndex++) {
            let knob = document.createElement("ui-knob");
            let min = algoMods[modIndex].min ? algoMods[modIndex].min : 0;
            let max = algoMods[modIndex].max ? algoMods[modIndex].max : 64;
            knob.setAttribute("min", min);
            knob.setAttribute("max", max);

            let currentMod = this.sequence[this.selectedTrack].mod[modIndex];

            knob.setAttribute("default", currentMod ? currentMod : min);
            knob.setAttribute("label", algoMods[modIndex].name);

            knob.setAttribute("integer-mode", algoMods[modIndex].integerMode);

            knob.addEventListener("input", (e) =>
                this._onControlInput(e, modIndex),
            );

            knobs.push(knob);
        }

        return knobs;
    }

    algorithmSelectOptions() {
        let options = [];
        for (let alIndex = 0; alIndex < this.algorithms.length; alIndex++) {
            let optionElement = document.createElement("option");
            let hash = util.hashCode(this.algorithms[alIndex].fn.toString());
            if (hash == this.selectedAlgorithm) optionElement.selected = true;
            optionElement.value = hash;
            optionElement.textContent = this.algorithms[alIndex].name;
            options.push(optionElement);
        }
        return options;
    }
}

customElements.define("ui-arpeggiator", Arpeggiator);

export default Arpeggiator;
