import * as Tone from "tone";
import Patch from "./patch.js";

import * as basicPatch from "./objects/patches/basic.json";

// TODO: note release

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnPlayPause").addEventListener("click", () => {
        Tone.start();
        Tone.Transport.toggle();
    });

    document.getElementById("bpmSlider").addEventListener("input", e => {
        Tone.Transport.bpm.value = e.target.value;
    });

    let test = new Patch(basicPatch);

    let sequencer = document.querySelector("ui-sequencer");

    Tone.Transport.scheduleRepeat((time) => {
        let trig = sequencer.next();
        if (trig) {
            for (let module of test.modules) {
                if (module.name === "AmplitudeEnvelope") module.triggerAttack(time);
                if (module.name === "FrequencyEnvelope") module.triggerAttack(time);
            }
        }
    }, "16n");

    Tone.Transport.start();
});
