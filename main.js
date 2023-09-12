import * as Tone from "tone";
import Patch from "./patch.js";

// TODO: note release

let sequence_length = 16;

function cool_algo1(t, mod1) {
    return Math.sin(t ** mod1) > mod1 / 16;
}

function generate_sequence(algo, mod1) {
    let sequence = [];
    for (let index = 0; index < sequence_length; index++) {
        sequence.push(algo(index, mod1));
    }
    return sequence;
}

function update_sequence(noteboxes, new_sequence) {
    let index = 0;
    for (let notebox of noteboxes) {
        if (new_sequence[index]) notebox.classList.add("active");
        else notebox.classList.remove("active");
        ++index;
    }
}

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

    let mod1 = document.getElementById("algomod1Slider");

    mod1.addEventListener("input", e => {
        update_sequence(noteboxes, generate_sequence(cool_algo1, e.target.value));
    });

    let index = 0;

    noteboxes[(index + 15) % 16].classList.toggle("marker");

    document.createElement("ui-knob");

    let test = new Patch();
    test.loadModules([
        new Tone.Oscillator(),
        new Tone.Filter(),
        new Tone.AmplitudeEnvelope()
    ]);

    test.addConnect(test.modules[0],
        test.modules[1]);

    test.addConnect(test.modules[1],
        test.modules[2]);

    test.modules[2].sustain = 0;

    test.modules[0].start();
    test.modules[2].toDestination();

    Tone.Transport.scheduleRepeat((time) => {
        noteboxes[index].classList.toggle("marker");

        noteboxes[(index + 15) % 16].classList.toggle("marker");

        if (noteboxes[index].classList.contains("active")) {

            for (let module of test.modules) {
                if (module.name === "AmplitudeEnvelope") module.triggerAttack(time);
            }
        }

        index = (index + 1) % 16;
    }, "16n");

    Tone.Transport.start();
});
