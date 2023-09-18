import * as sequencerStyle from "/styles/sequencer.styl?inline";
import defaultAlgorithms from "../sequence-algorithms.js";

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

        const style = document.createElement("style");
        style.textContent = sequencerStyle.default;
        this.shadow.appendChild(style);

        const container = document.createElement("div");
        container.id = "sequenceGrid";
        this.shadow.appendChild(container);

        this.container = container;

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
        this.step = this.#sequenceLength;

        this.shadow.appendChild(steps);
        this.shadow.appendChild(stepsLabel);
    }

    next() {
        this.step = (this.step + 1) % this.#sequenceLength;

        let markerStep = this.shadow.querySelector(".marker");
        if (markerStep) markerStep.classList.remove("marker");

        this.noteboxes[this.step].classList.add("marker");
        return this.sequence[this.step];
    }

    set sequenceLength(length) {
        this.#sequenceLength = length;
        this.populateGrid();
    }

    registerAlgorithm(name, fn) {
        this.algorithms.push({
            "name": name,
            "fn": fn
        });
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
