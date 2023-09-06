import * as Tone from 'tone';

// TODO: note release

class Module {
  constructor() {}
}

const synth = new Tone.Synth().toDestination();

const env = new Tone.AmplitudeEnvelope({
  attack: 0.01,
  decay: 0.21,
  sustain: 0,
  release: 1.2
}).toDestination();

const osc = new Tone.Oscillator({
  partials: [3, 2, 1],
  type: "custom",
  frequency: "C#4",
  volume: -8,
}).connect(env).start();

const osc2 = new Tone.Oscillator({
  partials: [3, 2, 1],
  type: "custom",
  frequency: "C#4",
  volume: -8,
}).connect(env).start();

const freqEnv = new Tone.FrequencyEnvelope({
  attack: 0,
  decay: 0.2,
  sustain: 0.1,
  release: 0.2,
  baseFrequency: "C0",
  octaves: 3
});
freqEnv.connect(osc.frequency);

const noiseEnv = new Tone.AmplitudeEnvelope({
  attack: 0.01,
  decay: 0.21,
  sustain: 0,
  release: 0
}).toDestination();

const noise = new Tone.Noise("white");
const filter = new Tone.Filter(1500, "lowpass");
noise.chain(filter, noiseEnv, Tone.Destination).start();

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

document.addEventListener("DOMContentLoaded", e => {
  document.getElementById("btnPlayPause").addEventListener("click", e => {
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
    update_sequence(noteboxes, generate_sequence(cool_algo1, e.target.value))
  });

  // let mod1value = 0;
  // window.setInterval(() => {
  //   mod1value++;
  //   update_sequence(noteboxes, generate_sequence(cool_algo1, mod1value % 16))
  // }, 1000);

  let index = 0;

  noteboxes[(index + 15) % 16].classList.toggle("marker");

  Tone.Transport.scheduleRepeat((time) => {
    noteboxes[index].classList.toggle("marker");

    noteboxes[(index + 15) % 16].classList.toggle("marker");

    if (noteboxes[index].classList.contains("active")) {
      env.triggerAttack(time);
      freqEnv.triggerAttack(time);
      noiseEnv.triggerAttack(time);
      freqEnv.triggerRelease(time + 1);
    }

    index = (index + 1) % 16;
  }, "16n");

  Tone.Transport.start();
});
