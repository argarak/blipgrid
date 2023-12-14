import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as sequencerStyle from "/styles/components/sequencer.styl?inline";
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
class Sequencer extends LitElement {
    triggerGrid = createRef();
    progress = createRef();
    stepsInput = createRef();

    static properties = {
        selectedAlgorithm: { type: Number, state: true },
        selectedTrack: { type: Number, state: true },
    };

    _onAlgorithmSelectInput(e) {
        e.preventDefault();
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
        this.selectedAlgorithm = util.hashCode(algorithm.fn.toString());
    }

    _onStepsInput(e) {
        let value = parseInt(e.target.value);
        if (isNaN(value)) {
            value = 1;
            e.target.value = 1;
        }
        if (value < 1) value = 1;
        if (value > 64) value = 64;

        this.sequence[this.selectedTrack].length = value;
        this.sequence[this.selectedTrack].sequence = this.generateSequence();
        this.triggerGrid.value.apply(
            this.sequence[this.selectedTrack].sequence,
            value,
        );
    }

    _onControlInput(e, modIndex) {
        this.sequence[this.selectedTrack].mod[modIndex] = e.target.value;
        this.sequence[this.selectedTrack].sequence = this.generateSequence();
        this.triggerGrid.value.apply(
            this.sequence[this.selectedTrack].sequence,
            this.sequence[this.selectedTrack].length,
        );
    }

    _onViewTitleClick(e) {
        e.target.classList.toggle("minimise");
    }

    render() {
        this.tabs = this.createTabs();
        const algorithmOptions = this.algorithmSelectOptions();
        const algorithmControls = this.algorithmControls();
        const length = this.sequence[this.selectedTrack].length;
        return html`
            <div id="trackTabs">${this.tabs}</div>
            <h3 id="viewTitle" @click=${this._onViewTitleClick}>
                <span class="material-icons">grid_view</span>
                <span class="text">rhythmic pattern</span>
            </h3>
            <select id="algorithmSelect" @input=${this._onAlgorithmSelectInput}>
                ${algorithmOptions}
            </select>
            <div id="sequenceGridContainer">
                <ui-trigger-grid
                    ${ref(this.triggerGrid)}
                    sequence="${this.sequence[this.selectedTrack].sequence}"
                >
                </ui-trigger-grid>
            </div>
            <div id="stepsContainer">
                <input
                    id="seqSteps"
                    type="number"
                    min="1"
                    max="64"
                    .value="${length}"
                    size="2"
                    @input="${this._onStepsInput}"
                />
                <label for="seqSteps">steps</label>
            </div>
            <div id="knobContainer">${algorithmControls}</div>
            <div id="progress"><div ${ref(this.progress)}></div></div>
        `;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(sequencerStyle.default)}
        `,
    ];

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
                algorithm: this.algorithms[0],
                index: trackIndex,

                mute: false,
                solo: false,
            };
        }

        this.selectedAlgorithm = util.hashCode(
            this.sequence[this.selectedTrack].algorithm.fn.toString(),
        );

        // keeps track of the current step position
        // initially at the end of the sequence so that the sequence can start
        // at step zero when the first next() method is called
        this.step = defaultLength;

        this.tabs = this.createTabs();

        this.switchTrack(0);
    }

    savePatchState() {
        const state = {};
        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            state[trackIndex] = this.sequence[trackIndex].patch.patchObject;
        }
        return state;
    }

    saveControlState() {
        const state = {};
        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            state[trackIndex] =
                this.sequence[trackIndex].patch.saveControlState();
        }
        return state;
    }

    saveState() {
        const state = {};

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            let trackState = {};
            let track = this.sequence[trackIndex];

            trackState["mod"] = track["mod"];
            trackState["length"] = track["length"];
            // store algorithm reference
            trackState["algorithm"] = util.hashCode(
                track.algorithm.fn.toString(),
            );

            state[trackIndex] = trackState;
        }

        return state;
    }

    assignPatch(trackIndex, patch) {
        this.sequence[trackIndex].patch = patch;
    }

    getCurrentTrack() {
        return this.sequence[this.selectedTrack];
    }

    setMute(trackIndex, state) {
        this.sequence[trackIndex].mute = state;
    }

    setSolo(trackIndex, state) {
        this.sequence[trackIndex].solo = state;
    }

    switchTrack(trackIndex) {
        this.selectedTrack = trackIndex;

        const switchTrackEvent = new CustomEvent("trackSwitch", {
            detail: this.sequence[this.selectedTrack],
        });

        if ("value" in this.triggerGrid) {
            this.triggerGrid.value.apply(
                this.sequence[this.selectedTrack].sequence,
                this.sequence[this.selectedTrack].length,
            );
        }

        this.selectedAlgorithm = util.hashCode(
            this.sequence[this.selectedTrack].algorithm.fn.toString(),
        );
        document.dispatchEvent(switchTrackEvent);
        this.requestUpdate();
    }

    nextStep() {
        this.step += 1;
        if ("value" in this.progress) {
            const length = this.sequence[this.selectedTrack].length;
            this.progress.value.style.width =
                util.map(this.step % length, 0, length, 0, 100) + "%";
        }
        return this.step;
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

        let trigger =
            this.sequence[trackIndex % this.numTracks].sequence[
                this.step % length
            ];

        if (trigger) {
            this.tabs[trackIndex].classList.add("trig");
        } else {
            this.tabs[trackIndex].classList.remove("trig");
        }

        return trigger;
    }

    registerAlgorithm(name, fn) {
        this.algorithms.push({
            name: name,
            fn: fn,
        });
    }

    createTabs() {
        let tabs = [];

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            let tab = document.createElement("div");
            tab.classList.add("trackTab");
            tab.innerText = trackIndex + 1;

            if (trackIndex === this.selectedTrack) tab.classList.add("active");
            if (this.sequence[trackIndex].mute) tab.classList.add("mute");
            if (this.sequence[trackIndex].solo) tab.classList.add("solo");

            tab.addEventListener("click", () => this.switchTrack(trackIndex));

            tabs.push(tab);
        }

        return tabs;
    }

    algorithmControls() {
        let knobs = [];

        const algoMods = this.sequence[this.selectedTrack].algorithm.mods;

        for (let modIndex = 0; modIndex < algoMods.length; modIndex++) {
            let knob = document.createElement("ui-knob");
            let currentMod = this.sequence[this.selectedTrack].mod[modIndex];

            let min = algoMods[modIndex].min ? algoMods[modIndex].min : 0;
            let max = algoMods[modIndex].max ? algoMods[modIndex].min : 64;
            knob.setAttribute("min", min);
            knob.setAttribute("max", max);

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
            optionElement.value = hash;
            if (hash == this.selectedAlgorithm) optionElement.selected = true;
            optionElement.textContent = this.algorithms[alIndex].name;
            options.push(optionElement);
        }
        return options;
    }

    generateSequence() {
        let sequence = [];
        let thisSequence = this.sequence[this.selectedTrack];
        for (let index = 0; index < thisSequence.length; index++) {
            sequence.push(
                thisSequence.algorithm.fn(
                    index,
                    thisSequence.length,
                    thisSequence.mod,
                ),
            );
        }
        return sequence;
    }
}

customElements.define("ui-sequencer", Sequencer);

export default Sequencer;
