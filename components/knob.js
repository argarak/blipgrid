import * as knobStyle from "/styles/knob.styl?inline";

// TODO: disable ability (cannot be modified)
// TODO: custom events : input, change
// TODO: fancy circular progress element

// TODO: indicator LED at the top left corner (it gets brighter the higher the value)
// TODO: touch support

// TODO: improved prompt
// keyboard support?

class Knob extends HTMLElement {
    constructor() {
        super();
        let self = this;

        /*
         * observer looks for changes in element attribute to updates class
         * properties, reload the text element and set the knob position
         */
        let observer = new MutationObserver(mutations => {
            mutations.forEach(() => {
                self.max = self.getAttribute("max") ?
                    parseFloat(self.getAttribute("max")) : 100;

                self.min = self.getAttribute("min") ?
                    parseFloat(self.getAttribute("min")) : 0;

                self.default = self.getAttribute("default") ?
                    parseFloat(self.getAttribute("default")) : 0;

                self.value = self.default;
                self.pos = self.map(self.value, self.min, self.max, 0, 100);
                self.update(0);

                self.label = self.getAttribute("label") ?
                    self.getAttribute("label") : "";

                if (self.labelElement) {
                    self.labelElement.textContent = self.label;
                }
            });
        });

        observer.observe(this, {
            attributes: true
        });

        this.eventInput = new CustomEvent("input", { knob: this });

        // from 0 to 100
        this.pos = 0;
        this.mouseOrigin = null;
        this.knobSpeed = 1;
        this.maxSpeed = 4;
        this.wheelSpeed = 4;

        this.max = this.getAttribute("max") ?
            parseFloat(this.getAttribute("max")) : 100;

        this.min = this.getAttribute("min") ?
            parseFloat(this.getAttribute("min")) : 0;

        this.default = this.getAttribute("default") ?
            parseFloat(this.getAttribute("default")) : 0;

        this.value = this.default;

        // pos is a value that must be between 0 and 100 becaus this dictates
        // only the position of the knob, and not it's value. this is important
        // because without this, moving a knob of a high min max difference
        // would take a long time
        this.pos = this.map(this.default, this.min, this.max, 0, 100);

        let shadow = this.attachShadow({mode: "open"});

        const container = document.createElement("div");
        container.id = "knob";
        shadow.appendChild(container);

        const style = document.createElement("style");
        style.textContent = knobStyle.default;
        shadow.appendChild(style);

        container.innerHTML = `
            <svg width="50px" height="50px">
                <defs>
                    <radialGradient id="backfill">
                        <stop offset="0%" stop-color="#222"></stop>
                        <stop offset="80%" stop-color="#111"></stop>
                    </radialGradient>
                </defs>

                <g>
                    <circle class="outline"></circle>
                    <line class="marker" x1="50%" y1="50%"/>
                </g>
            </svg>
        `;

        this.label = this.getAttribute("label") ?
            this.getAttribute("label") : "";

        this.labelElement = document.createElement("div");
        this.labelElement.classList.add("label");
        this.labelElement.textContent = this.label;

        container.appendChild(this.labelElement);

        this.marker = shadow.querySelector(".marker");
        this.marker.style.stroke = this.getAttribute("marker") ?
            this.getAttribute("marker") : "#444";

        window.addEventListener("mousemove", e => {
            if (window.inputKnob) {
                if (!self.mouseOrigin) self.mouseOrigin = e.pageY;

                let d = -(e.pageY - self.mouseOrigin)/4 * self.knobSpeed;

                if (d > self.maxSpeed) d = self.maxSpeed;
                else if (d < -this.maxSpeed) d = -self.maxSpeed;

                self.mouseOrigin = e.pageY;
                window.inputKnob.update(d);

                window.inputKnob.labelElement.textContent =
                    window.inputKnob.value.toFixed(2);
            }
        });

        window.addEventListener("mouseup", () => {
            window.inputKnob = null;
            self.mouseOrigin = null;
            self.labelElement.textContent = self.label;
        });

        this.addEventListener("dblclick", () => {
            self.pos = self.default;
            self.update(0);
        });

        this.addEventListener("wheel", e => {
            e.preventDefault();
            self.update(e.deltaY > 0 ? -self.wheelSpeed : self.wheelSpeed);
            self.labelElement.textContent = self.value.toFixed(2);
        });

        this.addEventListener("mousedown", () => {
            window.inputKnob = self;
            self.labelElement.textContent = self.value.toFixed(2);
        });

        this.addEventListener("mouseleave", () => {
            self.labelElement.textContent = self.label;
        });

        this.addEventListener("contextmenu", e => {
            e.preventDefault();
            let inputValue = prompt("enter value:::");
            self.value = inputValue ? parseInt(inputValue) : self.value;
            self.pos = self.map(self.value, self.min, self.max, 0, 100);

            self.update(0);

            return false;
        });
    }

    map(x, in_min, in_max, out_min, out_max) {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    update(d) {
        if (this.pos + d > 100) this.pos = 100;
        else if (this.pos + d < 0) this.pos = 0;
        else this.pos += d;

        this.dispatchEvent(this.eventInput);

        let deg = (this.pos / 100) * (1.5 * Math.PI) + (0.75 * Math.PI);

        this.marker.setAttribute("x2", 50 + Math.cos(deg) * 40 + "%");
        this.marker.setAttribute("y2", 50 + Math.sin(deg) * 40 + "%");

        this.value = this.map(this.pos, 0, 100, this.min, this.max);
    }
}

customElements.define("ui-knob", Knob);

export default Knob;
