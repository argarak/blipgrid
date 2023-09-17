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

        let shadow = this.attachShadow({mode: "open"});

        const style = document.createElement("style");
        style.textContent = sequencerStyle.default;
        shadow.appendChild(style);

        const container = document.createElement("div");
        container.id = "sequenceGrid";
        shadow.appendChild(container);

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

        shadow.appendChild(steps);
        shadow.appendChild(stepsLabel);
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
        let new_sequence = this.generate_sequence();
        console.log(this.noteboxes);

        let index = 0;
        for (let notebox of this.noteboxes) {
            if (new_sequence[index]) notebox.classList.add("active");
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
