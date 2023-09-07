
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

        this.eventInput = new CustomEvent("input", { knob: this });

        // from 0 to 100
        this.pos = 0;
        this.mouseOrigin = null;
        this.knobSpeed = 1;
        this.maxSpeed = 4;
        this.wheelSpeed = 4;

        this.max = this.getAttribute("max") ? parseInt(this.getAttribute("max")) : 100;
        this.min = this.getAttribute("min") ? parseInt(this.getAttribute("min")) : 0;

        this.default = this.getAttribute("default") ? parseInt(this.getAttribute("default")) : 0;
        this.value = this.default;

        // pos is a value that must be between 0 and 100 becaus this dictates
        // only the position of the knob, and not it's value. this is important
        // because without this, moving a knob of a high min max difference
        // would take a long time
        this.pos = this.map(this.default, this.min, this.max, 0, 100);

        const container = document.createElement("div");
        container.id = "knob";
        this.appendChild(container);

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

        this.label = document.createElement("div");
        this.label.classList.add("label");
        this.label.textContent = this.getAttribute("label");

        container.appendChild(this.label);

        this.marker = this.querySelector(".marker");
        this.marker.style.stroke = this.getAttribute("marker") ? this.getAttribute("marker") : "#aaa";
        let self = this;

        window.addEventListener("mousemove", e => {
            if (window.inputKnob) {
                if (!self.mouseOrigin) self.mouseOrigin = e.pageY;

                let d = -(e.pageY - self.mouseOrigin)/4 * self.knobSpeed;

                if (d > self.maxSpeed) d = self.maxSpeed;
                else if (d < -this.maxSpeed) d = -self.maxSpeed;

                self.mouseOrigin = e.pageY;
                window.inputKnob.update(d);

                window.inputKnob.label.textContent = window.inputKnob.value;
            }
        });

        this.update(0);

        window.addEventListener("mouseup", e => {
            window.inputKnob = null;
            self.mouseOrigin = null;
            self.label.textContent = self.getAttribute("label");
        });

        this.addEventListener("dblclick", e => {
            self.pos = self.default;
            self.update(0);
        });

        this.addEventListener("wheel", e => {
            e.preventDefault();
            self.update(e.deltaY > 0 ? -self.wheelSpeed : self.wheelSpeed);
            self.label.textContent = self.value;
        });

        this.addEventListener("mousedown", e => {
            window.inputKnob = self;
            self.label.textContent = self.value;
        });

        this.addEventListener("mouseleave", e => {
            self.label.textContent = self.getAttribute("label");
        });

        this.addEventListener("contextmenu", e => {
            e.preventDefault();
            let inputValue = prompt("enter value:::");
            self.pos = inputValue ? parseInt(inputValue) : self.pos;

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
