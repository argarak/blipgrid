import "/styles/main.styl";

import * as Tone from "tone";
import Patch from "./patch.js";
import Mixer from "./mixer.js";

import keyHandler from "./keys.js";

import * as basicPatch from "./objects/patches/basic.json";
import * as basicSynthPatch from "./objects/patches/basic-synth.json";

// TODO: note release

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

    const sequencer = document.querySelector("ui-sequencer");
    const arpeggiator = document.querySelector("ui-arpeggiator");
    const editView = document.querySelector("ui-edit-view");

    const mixer = new Mixer(sequencer);

    document.addEventListener("trackSwitch", e => {
        let track = e.detail;
        editView.registerTrack(track);
        arpeggiator.switchTrack(e.detail.index);
    });

    for (let trackIndex = 0; trackIndex < sequencer.numTracks; trackIndex++) {
        let patch = new Patch(
            trackIndex % 2 == 0 ? basicSynthPatch : basicPatch,
            mixer, trackIndex
        );
        sequencer.assignPatch(trackIndex, patch);
        if (trackIndex === sequencer.selectedTrack) {
            editView.registerTrack(sequencer.sequence[trackIndex]);
        }
    }

    function setFrequency(modules, frequency, time) {
        for (let module of modules) {
            if (module.name === "Oscillator") module.frequency.setValueAtTime(frequency, time);
        }
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
    keyHandler.registerKey("a", [], () => {
        let modules = sequencer.getCurrentTrack().patch.modules;
        let time = Tone.now();
        setFrequency(modules, Tone.Frequency(60, "midi"), time);
        trigger(modules, time);
    });

    for (let trackIndex = 1; trackIndex <= sequencer.numTracks; trackIndex++) {
        keyHandler.registerKey(`Digit${trackIndex}`, ["shift"], () => {
            console.debug(`muting channel ${trackIndex - 1}`);
            mixer.toggleMute(trackIndex - 1);
        });

        keyHandler.registerKey(`Digit${trackIndex}`, ["ctrl"], () => {
            console.debug(`soloing channel ${trackIndex - 1}`);
            mixer.toggleSolo(trackIndex - 1);
        });

        keyHandler.registerKey(`Digit${trackIndex}`, [], () => {
            console.debug(`switching to track ${trackIndex - 1}`);
            sequencer.switchTrack(trackIndex - 1);
        });
    }

    Tone.Transport.scheduleRepeat((time) => {
        let t = sequencer.nextStep();

        for (let trackIndex = 0; trackIndex < sequencer.numTracks; trackIndex++) {
            let trig = sequencer.next(trackIndex);
            if (trig) {
                let frequency = arpeggiator.next(trackIndex, t % sequencer.sequence[trackIndex].length);
                setFrequency(sequencer.sequence[trackIndex].patch.modules, frequency, time);
                trigger(sequencer.sequence[trackIndex].patch.modules, time);
            }
        }
    }, "16n");

    Tone.Transport.start();
});
