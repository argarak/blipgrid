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
class Sequencer extends HTMLElement {
    #sequenceLength;

    constructor() {
        super();
        let self = this;

        this.numTracks = 8;
        this.selectedTrack = 0;

        // all algorithms registered by this sequencer
        this.algorithms = defaultAlgorithms;

        // holds list of notebox DOM elements
        this.noteboxes = [];

        let defaultLength = 64;

        // holds currently programmed sequencer
        this.sequence = {};

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            this.sequence[trackIndex] = {
                mod: [],
                patch: null,
                length: defaultLength,
                sequence: [],
                algorithm: this.algorithms[0]
            };
        }

        this.shadow = this.attachShadow({mode: "open"});

        // create the style element which contains all local CSS for this
        // component
        const style = document.createElement("style");
        style.textContent = sequencerStyle.default;
        this.shadow.appendChild(style);

        // add track tabs
        this.tabContainer = this.createTabs();
        this.shadow.appendChild(this.tabContainer);

        // create the algorithm select element to choose the algorithm the
        // sequencer will use
        this.algorithmSelect = document.createElement("select");
        this.algorithmSelect.id = "algorithmSelect";
        this.populateAlgorithmSelect();
        this.shadow.appendChild(this.algorithmSelect);

        this.algorithmSelect.addEventListener("input", e => {
            let algorithm = null;
            for (algorithm of self.algorithms) {
                if (parseInt(e.target.value) ===
                    util.hashCode(algorithm.fn.toString())) {
                    break;
                }
                // TODO: error if not found
            }

            self.sequence[self.selectedTrack].algorithm = algorithm;

            self.update();
            self.algorithmControls();
        });

        let algorithmSelectLabel = document.createElement("label");
        algorithmSelectLabel.setAttribute("for", "algorithmSelect");
        algorithmSelectLabel.textContent = "algorithm";
        //this.shadow.appendChild(algorithmSelectLabel);

        // create a container for the container.....
        const superContainer = document.createElement("div");
        superContainer.id = "sequenceGridContainer";
        this.shadow.appendChild(superContainer);

        // create a container for the sequence grid
        const container = document.createElement("div");
        container.id = "sequenceGrid";
        superContainer.appendChild(container);
        this.container = container;

        // create an input to change the number of steps in the sequence
        const steps = document.createElement("input");
        steps.id = "seqSteps";
        steps.type = "number";
        steps.min = 1;
        steps.max = 64;
        steps.value = 64;
        steps.size = 2;

        steps.addEventListener("input", e => {
            self.sequenceLength = e.target.value;
        });

        const stepsLabel = document.createElement("label");
        stepsLabel.setAttribute("for", "seqSteps");
        stepsLabel.textContent = "steps";

        this.sequenceLength = 64;

        // keeps track of the current step position
        // initially at the end of the sequence so that the sequence can start
        // at step zero when the first next() method is called
        this.step = this.#sequenceLength;

        let stepsContainer = document.createElement("div");
        stepsContainer.id = "stepsContainer";
        stepsContainer.appendChild(steps);
        stepsContainer.appendChild(stepsLabel);
        this.shadow.appendChild(stepsContainer);

        // create container to hold algorithm specific controls
        this.knobContainer = document.createElement("div");
        this.knobContainer.id = "knobContainer";
        this.algorithmControls();
        this.shadow.appendChild(this.knobContainer);

        this.switchTrack(0);
    }

    /**
     * setter for the private sequenceLength property. automatically
     * updates the note grid when this property is changed.
     * @param length : new integer length (must be less than or equal to 64)
     **/
    set sequenceLength(length) {
        this.#sequenceLength = length;
        this.populateGrid();
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

        let hash = util.hashCode(this.sequence[this.selectedTrack].algorithm.fn.toString());
        this.algorithmSelect.value = hash;
        document.dispatchEvent(switchTrackEvent);

        this.algorithmControls();
        this.update();

        console.log(this.sequence[this.selectedTrack]);

        let tabs = this.tabContainer.children;
        for (let tab of tabs) {
            tab.classList.remove("active");
        }
        tabs[trackIndex % this.numTracks].classList.add("active");
    }

    createTabs() {
        let tabContainer = document.createElement("div");
        tabContainer.id = "trackTabs";

        for (let trackIndex = 0; trackIndex < this.numTracks; trackIndex++) {
            let tab = document.createElement("div");
            tab.classList.add("trackTab");
            tab.innerText = trackIndex + 1;

            tab.addEventListener("click", () =>
                this.switchTrack(trackIndex));

            tabContainer.appendChild(tab);
        }

        return tabContainer;
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
            let thisNotebox = this.noteboxes[this.step % length];
            let markerStep = this.shadow.querySelector(".marker");
            if (markerStep) markerStep.classList.remove("marker");
            thisNotebox.classList.add("marker");
            thisNotebox.scrollIntoView();
        }

        return this.sequence[trackIndex % this.numTracks].sequence[this.step % length];
    }

    registerAlgorithm(name, fn) {
        this.algorithms.push({
            "name": name,
            "fn": fn
        });

        this.populateAlgorithmSelect();
    }

    onControlInput(e, modIndex) {
        this.sequence[this.selectedTrack].mod[modIndex] = e.target.value;
        this.update();
    }

    algorithmControls() {
        this.knobContainer.innerHTML = "";

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
                this.onControlInput(e, modIndex));

            this.knobContainer.appendChild(knob);
        }
    }

    populateAlgorithmSelect() {
        this.algorithmSelect.innerHTML = "";
        for (let alIndex = 0; alIndex < this.algorithms.length; alIndex++) {
            let optionElement = document.createElement("option");
            optionElement.value = util.hashCode(this.algorithms[alIndex].fn.toString());
            optionElement.textContent = this.algorithms[alIndex].name;
            this.algorithmSelect.appendChild(optionElement);
        }
    }

    generateSequence() {
        let sequence = [];
        for (let index = 0; index < this.#sequenceLength; index++) {
            sequence.push(
                this.sequence[this.selectedTrack]
                    .algorithm.fn(index,
                        this.sequence[this.selectedTrack].length,
                        this.sequence[this.selectedTrack].mod)
            );
        }
        return sequence;
    }

    update() {
        this.sequence[this.selectedTrack].sequence = this.generateSequence();

        let index = 0;
        for (let notebox of this.noteboxes) {
            if (this.sequence[this.selectedTrack].sequence[index]) {
                notebox.classList.add("active");
            }
            else notebox.classList.remove("active");
            ++index;
        }
    }

    populateGrid() {
        console.log(this.#sequenceLength);

        this.noteboxes = [];
        this.container.innerHTML = "";

        for (let noteIndex = 0; noteIndex < this.#sequenceLength; noteIndex++) {
            let noteBox = document.createElement("div");
            noteBox.classList.add("noteBox");
            this.container.appendChild(noteBox);
            this.noteboxes.push(noteBox);
        }

        this.update();
    }
}

customElements.define("ui-sequencer", Sequencer);

export default Sequencer;
