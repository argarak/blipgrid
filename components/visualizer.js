import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
//import * as triggerGridStyle from "/styles/components/trigger-grid.styl?inline";

import * as Tone from "tone";

class Visualizer extends LitElement {
    canvas = createRef();

    render() {
        return html`<canvas
            width="1280"
            height="720"
            ${ref(this.canvas)}
        ></canvas>`;
    }

    static styles = css`
        canvas {
            width: 100%;
            height: 100%;
            filter: brightness(20%);
        }
    `;

    constructor() {
        super();
        this.barsGap = 5;
        this.initHeight = 5;
        this.counter = 0;
        this.randomMod = 1;
        this.analyser = new Tone.Analyser("fft", 256);
        Tone.Destination.connect(this.analyser);

        this.bufferLength = 256;
        this.barGradient = null;
    }

    firstUpdated() {
        this.canvasInit();
    }

    rand(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    canvasInit() {
        let canvas = this.canvas.value;
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
        } else {
            console.error("canvas could not be initialised");
        }

        if (this.analyser) {
            // fft data stuff
            //this.analyser.fftSize = 256;
            //this.bufferLength = this.analyser.frequencyBinCount;
            //this.dataArray = new Uint8Array(this.bufferLength);

            this.barsWidth = (canvas.width / this.bufferLength) * 2.5;
        }

        if (!this.barGradient) {
            // rainbow gradient!!
            this.barGradient = ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height * 1.2,
            );
            let sumcolors = 1 / 4;
            this.barGradient.addColorStop(sumcolors * 0, "red");
            this.barGradient.addColorStop(sumcolors * 1, "orange");
            this.barGradient.addColorStop(sumcolors * 2, "yellow");
            this.barGradient.addColorStop(sumcolors * 3, "green");
        }

        this.x = canvas.width / 2;
        this.y = canvas.height / 2;

        ctx.imageSmoothingEnabled = false;

        for (let i = 0; i < Math.floor(canvas.width / this.barsWidth); i++) {
            ctx.fillStyle = this.barGradient;
            ctx.fillRect(
                i * (this.barsWidth + this.barsGap),
                canvas.height - this.initHeight,
                this.barsWidth,
                this.initHeight,
            );
        }

        requestAnimationFrame(() => {
            this.updateCanvas(ctx, canvas);
        });
    }

    updateCanvas(ctx, canvas) {
        this.dataArray = this.analyser.getValue();

        // clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = this.barGradient;
        ctx.fillRect(canvas.width / 2, canvas.height / 2, 40, 40);

        for (let i = 0; i < this.dataArray.length; i++) {
            let barHeight = this.dataArray[i];

            ctx.fillStyle = this.barGradient;
            ctx.fillRect(
                i * (this.barsWidth + this.barsGap),
                -barHeight * 4,
                this.barsWidth,
                canvas.height + barHeight * 4,
            );
        }

        // things
        requestAnimationFrame(() => {
            this.updateCanvas(ctx, canvas);
        });
    }
}

customElements.define("ui-visualizer", Visualizer);
export default Visualizer;
