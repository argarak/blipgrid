import "/styles/main.styl";
import "@material-design-icons/font";

import * as Tone from "tone";
import Patch from "./patch.js";

import keyHandler from "./keys.js";

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

    function trigger(modules, time) {
        for (let module of modules) {
            if (module.name === "AmplitudeEnvelope") module.triggerAttack(time);
            if (module.name === "FrequencyEnvelope") module.triggerAttack(time);
        }
    }

    // FIXME currently the keys "roll", as is default OS behaviour
    // not sure whether we should deal with it somehow
    keyHandler.registerKey(["a"], () => {
        console.log("pew!");
        trigger(test.modules, Tone.now());
    });

    Tone.Transport.scheduleRepeat((time) => {
        let trig = sequencer.next();
        if (trig) trigger(test.modules, time);
    }, "16n");

    Tone.Transport.start();
});
