import * as sequencerStyle from "/styles/sequencer.styl?inline";

class Sequencer extends HTMLElement {
    constructor() {
        super();
        let self = this;

        let shadow = this.attachShadow({mode: "open"});

        const style = document.createElement("style");
        style.textContent = sequencerStyle.default;
        shadow.appendChild(style);

        const container = document.createElement("div");
        container.id = "sequenceGrid";
        shadow.appendChild(container);

        this.container = container;
        this.sequenceLength = 64;

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

        shadow.appendChild(steps);
        shadow.appendChild(stepsLabel);
    }

    set sequenceLength(length) {
        this.populateGrid(length);
    }

    populateGrid(length) {
        this.container.innerHTML = "";

        for (let noteIndex = 0; noteIndex < length; noteIndex++) {
            let noteBox = document.createElement("div");
            noteBox.classList.add("noteBox");
            this.container.appendChild(noteBox);
        }
    }
}

customElements.define("ui-sequencer", Sequencer);

export default Sequencer;
