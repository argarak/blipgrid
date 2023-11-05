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

    let sequencer = document.querySelector("ui-sequencer");

    for (let trackIndex = 0; trackIndex < sequencer.numTracks; trackIndex++) {
        let patch = new Patch(trackIndex % 2 == 0 ? basicSynthPatch : basicPatch);
        sequencer.assignPatch(trackIndex, patch);
        if (trackIndex === sequencer.selectedTrack) patch.drawControls();
    }

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
        trigger(sequencer.getCurrentTrack().patch.modules, Tone.now());
    });

    for (let trackIndex = 1; trackIndex <= sequencer.numTracks; trackIndex++) {
        keyHandler.registerKey([`${trackIndex}`], () => {
            sequencer.switchTrack(trackIndex - 1);
        });
    }

    Tone.Transport.scheduleRepeat((time) => {
        sequencer.nextStep();

        for (let trackIndex = 0; trackIndex < sequencer.numTracks; trackIndex++) {
            let trig = sequencer.next(trackIndex);
            if (trig) trigger(sequencer.sequence[trackIndex].patch.modules, time);
        }
    }, "16n");

    Tone.Transport.start();
});
