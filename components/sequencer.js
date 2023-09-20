import * as sequencerStyle from "/styles/sequencer.styl?inline";
import defaultAlgorithms from "../sequence-algorithms.js";

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

        // all algorithms registered by this sequencer
        this.algorithms = defaultAlgorithms;

        // select first algorithm by default
        this.algorithm = this.algorithms[0];

        // holds sequence modulation values
        this.mod = [32];

        // holds list of notebox DOM elements
        this.noteboxes = [];

        // holds currently programmed sequencer
        this.sequence = [];

        this.shadow = this.attachShadow({mode: "open"});

        // create the style element which contains all local CSS for this
        // component
        const style = document.createElement("style");
        style.textContent = sequencerStyle.default;
        this.shadow.appendChild(style);

        // create the algorithm select element to choose the algorithm the
        // sequencer will use
        this.algorithmSelect = document.createElement("select");
        this.algorithmSelect.id = "algorithmSelect";
        this.populateAlgorithmSelect();
        this.shadow.appendChild(this.algorithmSelect);

        this.algorithmSelect.addEventListener("input", e => {
            self.algorithm = self.algorithms[e.target.value];
            self.update();
            self.algorithmControls();
        });

        let algorithmSelectLabel = document.createElement("label");
        algorithmSelectLabel.setAttribute("for", "algorithmSelect");
        algorithmSelectLabel.textContent = "algorithm";
        this.shadow.appendChild(algorithmSelectLabel);

        // create a container for the sequence grid
        const container = document.createElement("div");
        container.id = "sequenceGrid";
        this.shadow.appendChild(container);
        this.container = container;

        // create an input to change the number of steps in the sequence
        const steps = document.createElement("input");
        steps.id = "seqSteps";
        steps.type = "number";
        steps.min = 1;
        steps.max = 64;
        steps.value = 64;

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
        this.algorithmControls();
        this.shadow.appendChild(this.knobContainer);
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

    /**
     * increments the sequencer, looping back to the start if necessary
     * @return whether the next step is active or inactive
     **/
    next() {
        this.step = (this.step + 1) % this.#sequenceLength;

        let markerStep = this.shadow.querySelector(".marker");
        if (markerStep) markerStep.classList.remove("marker");

        this.noteboxes[this.step].classList.add("marker");
        return this.sequence[this.step];
    }

    registerAlgorithm(name, fn) {
        this.algorithms.push({
            "name": name,
            "fn": fn
        });

        this.populateAlgorithmSelect();
    }

    onControlInput(e, modIndex) {
        this.mod[modIndex] = e.target.value;
        this.update();
    }

    algorithmControls() {
        this.knobContainer.innerHTML = "";

        for (let modIndex = 0;
            modIndex < this.algorithm.mods.length;
            modIndex++) {

            let knob = document.createElement("ui-knob");
            knob.setAttribute("min", 0);
            knob.setAttribute("max", 64);
            knob.setAttribute("default", 0);
            knob.setAttribute(
                "label", this.algorithm.mods[modIndex].name
            );

            knob.setAttribute(
                "integer-mode",
                this.algorithm.mods[modIndex].integerMode
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
            optionElement.value = alIndex;
            optionElement.textContent = this.algorithms[alIndex].name;
            this.algorithmSelect.appendChild(optionElement);
        }
    }

    generate_sequence() {
        let sequence = [];
        for (let index = 0; index < this.#sequenceLength; index++) {
            sequence.push(this.algorithm.fn(index, this.#sequenceLength, this.mod));
        }
        return sequence;
    }

    update() {
        this.sequence = this.generate_sequence();

        let index = 0;
        for (let notebox of this.noteboxes) {
            if (this.sequence[index]) notebox.classList.add("active");
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
