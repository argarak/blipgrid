import "/styles/main.styl";
import "@material-design-icons/font";

import * as Tone from "tone";
import Patch from "./patch.js";

import keyHandler from "./keys.js";

import * as basicPatch from "./objects/patches/basic.json";
import * as basicSynthPatch from "./objects/patches/basic-synth.json";

// TODO: note release

document.addEventListener("trackSwitch", e => {
    let track = e.detail;

    if (track.patch) {
        console.log(track.patch);
        track.patch.drawControls();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let btnPlay = document.getElementById("btnPlay");
    btnPlay.addEventListener("click", () => {
        Tone.start();
        Tone.Transport.toggle();
        if (Tone.Transport.state === "started") btnPlay.classList.add("active");
        else btnPlay.classList.remove("active");
    });

    document.getElementById("bpmSlider").addEventListener("input", e => {
        Tone.Transport.bpm.value = e.target.value;
    });

    let test = new Patch(basicPatch);
    let test2 = new Patch(basicSynthPatch);

    test.drawControls();

    let sequencer = document.querySelector("ui-sequencer");

    sequencer.assignPatch(0, test);
    sequencer.assignPatch(1, test2);

    function trigger(modules, time) {
        for (let module of modules) {
            if (module.name === "AmplitudeEnvelope") module.triggerAttack(time);
            if (module.name === "FrequencyEnvelope") module.triggerAttack(time);
            if (module.name === "Envelope") module.triggerAttack(time);
        }
    }

    // FIXME currently the keys "roll", as is default OS behaviour
    // not sure whether we should deal with it somehow
    keyHandler.registerKey(["a"], () => {
        console.log("pew!");
        trigger(test.modules, Tone.now());
    });

    for (let trackIndex = 1; trackIndex <= sequencer.numTracks; trackIndex++) {
        keyHandler.registerKey([`${trackIndex}`], () => {
            sequencer.switchTrack(trackIndex - 1);
        });
    }

    Tone.Transport.scheduleRepeat((time) => {
        sequencer.nextStep();

        let trig = sequencer.next(0);
        if (trig) trigger(test.modules, time);

        trig = sequencer.next(1);
        if (trig) trigger(test2.modules, time);
    }, "16n");

    Tone.Transport.start();
});
