import { LitElement, html, css, unsafeCSS } from "lit";
import * as knobStyle from "/styles/components/knob.styl?inline";
import util from "/scripts/util.js";

// TODO: disable ability (cannot be modified)
// TODO: touch support
// TODO: improved prompt
// keyboard support?

window.addEventListener("mousemove", (e) => {
    let currentKnob = window.inputKnob;
    if (!currentKnob) return;

    if (!currentKnob.mouseOrigin) currentKnob.mouseOrigin = e.pageY;

    let d = (-(e.pageY - currentKnob.mouseOrigin) / 4) * currentKnob.knobSpeed;

    if (d > currentKnob.maxSpeed) d = currentKnob.maxSpeed;
    else if (d < -currentKnob.maxSpeed) d = -currentKnob.maxSpeed;

    currentKnob.mouseOrigin = e.pageY;
    currentKnob.apply(d);

    currentKnob.labelContent = currentKnob.value.toFixed(
        currentKnob.integerMode ? 0 : 2,
    );
});

window.addEventListener("mouseup", () => {
    if (!window.inputKnob) return;
    window.inputKnob.mouseOrigin = null;
    window.inputKnob.labelContent = window.inputKnob.label;
    window.inputKnob = null;
});

class Knob extends LitElement {
    #default;

    static properties = {
        max: {
            type: Number,
        },
        min: {
            type: Number,
        },
        default: {
            type: Number,
        },
        integerMode: {
            attribute: "integer-mode",
            type: Boolean,
        },
        nonlinear: {
            type: Boolean,
        },
        value: {
            type: Number,
        },
        label: {
            type: String,
        },
        labelContent: {
            type: String,
            state: true,
            attribute: false,
        },
        marker: {
            type: String,
        },
        deg: {
            type: Number,
            state: true,
        },
    };

    static styles = css`
        ${unsafeCSS(knobStyle.default)}
    `;

    render() {
        return html` <div id="knob">
            <svg width="50px" height="50px">
                <g>
                    <path
                        class="outline-active"
                        d="${this.describeArc(
                            25,
                            25,
                            24,
                            0.75 * Math.PI,
                            this.deg,
                        )}"
                    />
                    <path
                        class="outline"
                        d="${this.describeArc(
                            25,
                            25,
                            24,
                            this.deg + 0.0001,
                            0.75 * Math.PI,
                        )}"
                    />
                    <line
                        class="marker"
                        x1="50%"
                        y1="50%"
                        x2=${50 + Math.cos(this.deg) * 48 + "%"}
                        y2=${50 + Math.sin(this.deg) * 48 + "%"}
                        stroke=${this.marker}
                    />
                </g>
            </svg>
            <div class="label">
                ${this.labelContent === "" ? this.label : this.labelContent}
            </div>
        </div>`;
    }

    set default(d) {
        this.value = this.integerMode ? Math.round(d) : d;
        this.pos = util.map(d, this.min, this.max, 0, 100);
        this.apply(0);
        this.dispatchEvent(this.eventInput);
        this.#default = d;
    }

    /* -- event handlers -- */
    _handleDblClick() {
        this.pos = util.map(this.#default, this.min, this.max, 0, 100);
        this.apply(0);
    }

    _handleWheel(e) {
        e.preventDefault();
        this.apply(e.deltaY > 0 ? -this.wheelSpeed : this.wheelSpeed);
        this.labelContent = this.value.toFixed(this.integerMode ? 0 : 2);
    }

    _handleMouseDown() {
        console.log(this.integerMode);
        window.inputKnob = this;
        this.labelContent = this.value.toFixed(this.integerMode ? 0 : 2);
    }

    _handleMouseLeave() {
        this.labelContent = this.label;
    }

    _handleContextMenu(e) {
        e.preventDefault();
        let inputValue = prompt("enter value:::");

        if (!this.integerMode) {
            this.value = inputValue ? parseFloat(inputValue) : this.value;
        } else {
            this.value = inputValue ? parseInt(inputValue) : this.value;
        }

        this.pos = util.map(this.value, this.min, this.max, 0, 100);

        this.apply(0);

        return false;
    }
    /* -- */

    polarToCartesian(centerX, centerY, radius, angleInRadians) {
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    }

    describeArc(x, y, radius, startAngle, endAngle) {
        var start = this.polarToCartesian(x, y, radius, endAngle);
        var end = this.polarToCartesian(x, y, radius, startAngle);

        let largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
        if (endAngle - startAngle < 0) {
            largeArcFlag =
                Math.abs(endAngle - startAngle) >= Math.PI ? "0" : "1";
        }

        return [
            "M",
            start.x,
            start.y,
            "A",
            radius,
            radius,
            0,
            largeArcFlag,
            0,
            end.x,
            end.y,
        ].join(" ");
    }

    constructor() {
        super();
        this.eventInput = new CustomEvent("input", { knob: this });

        this.mouseOrigin = null;
        this.knobSpeed = 2;
        this.maxSpeed = 4;
        this.wheelSpeed = 8;

        this.max = 100;
        this.min = 0;
        this.default = 0;

        this.label = "";
        this.labelContent = this.label;

        this.integerMode = false;
        this.nonlinear = false;
        this.value = this.integerMode
            ? Math.round(this.#default)
            : this.default;

        // pos is a value that must be between 0 and 100 because this dictates
        // only the position of the knob, and not it's value. this is important
        // because without this, moving a knob of a high min max difference
        // would take a long time
        this.pos = util.map(this.default, this.min, this.max, 0, 100);
        this.deg = 0;

        this.marker = "#fff";

        this.addEventListener("contextmenu", this._handleContextMenu);
        this.addEventListener("mouseleave", this._handleMouseLeave);
        this.addEventListener("mousedown", this._handleMouseDown);
        this.addEventListener("mouseup", this._handleMouseLeave);
        this.addEventListener("dblclick", this._handleDblClick);
        this.addEventListener("wheel", this._handleWheel);
        this.apply(0);
    }

    toNonLinear(x) {
        return x < 0 ? -Math.pow(-x, 1 / 4) : Math.pow(x, 1 / 4);
    }

    apply(d) {
        if (this.pos + d > 100) this.pos = 100;
        else if (this.pos + d < 0) this.pos = 0;
        else this.pos += d;

        this.deg = (this.pos / 100) * (1.5 * Math.PI) + 0.75 * Math.PI;

        let newValue;
        if (this.nonlinear) {
            newValue = util.map(
                this.toNonLinear(this.pos + 0.0001),
                this.toNonLinear(0.0001),
                this.toNonLinear(100),
                this.min,
                this.max,
            );
        } else {
            newValue = util.map(this.pos, 0, 100, this.min, this.max);
        }

        if (this.integerMode) this.value = Math.round(newValue);
        else this.value = newValue;

        this.dispatchEvent(this.eventInput);
    }
}

customElements.define("ui-knob", Knob);

export default Knob;
