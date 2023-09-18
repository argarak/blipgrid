import * as Tone from "tone";
import Patch from "./patch.js";

// TODO: note release

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnPlayPause").addEventListener("click", () => {
        Tone.start();
        Tone.Transport.toggle();
    });

    document.getElementById("bpmSlider").addEventListener("input", e => {
        Tone.Transport.bpm.value = e.target.value;
    });

    let noteboxes = document.querySelectorAll(".noteBox");

    for (let notebox of noteboxes) {
        notebox.addEventListener("click", e => {
            e.target.classList.toggle("active");
        });
    }

    let test = new Patch();
    test.loadModules([
        new Tone.FrequencyEnvelope(), // 0
        new Tone.Oscillator(),        // 1
        new Tone.Oscillator(),        // 2
        new Tone.AmplitudeEnvelope(), // 3
        new Tone.AmplitudeEnvelope(), // 4
        new Tone.Noise(),             // 5
        new Tone.Filter()             // 6
    ]);

    test.addConnect(test.modules[0], test.modules[1].frequency);
    test.addConnect(test.modules[0], test.modules[1].frequency);

    test.addConnect(test.modules[1], test.modules[3]);
    test.addConnect(test.modules[2], test.modules[3]);

    test.addConnect(test.modules[5], test.modules[4]);
    test.addConnect(test.modules[4], test.modules[6]);

    test.modules[1].start();
    test.modules[2].start();
    test.modules[5].start();

    test.modules[3].toDestination();
    test.modules[6].toDestination();

    test.modules[3].sustain = 0;
    test.modules[4].sustain = 0;

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
