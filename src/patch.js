import * as Tone from 'tone';
import moduleControls from './objects/module-controls.json';

class Patch {
  constructor() {
    this.modules = [];
    this.connects = [];

    this.paramContainer = document.getElementById("paramContainer");
  }

  addModule(module) {
    this.modules.push(module);
    this.updateControls();
  }

  loadModules(modulesList) {
    this.modules = modulesList;
    this.updateControls();
  }

  addConnect(input, output) {
    input.connect(output);
    this.connects.push([input, output]);
  }

  updateControls() {
    let index = 0;
    for (let module of this.modules) {
      let groupLabel = document.createElement("label");
      groupLabel.setAttribute("for", `knobsGroup${index}`);
      groupLabel.innerText = module.constructor.name;

      let knobsGroup = document.createElement("div");
      knobsGroup.id = `knobsGroup${index}`;
      knobsGroup.classList.add("knobSet");

      let controls = module.constructor.name in moduleControls ?
          moduleControls[module.constructor.name] : [];

      for (let control of controls) {
        let knob = document.createElement("ui-knob");
        knob.setAttribute("min", control.min);
        knob.setAttribute("max", control.max);
        knob.setAttribute("default", control.default);
        knob.setAttribute("label", control.label);

        let self = this;
        knob.addEventListener("input", e => {
          module.frequency.value = e.target.value;
        })

        knobsGroup.appendChild(knob);
      }

      this.paramContainer.appendChild(groupLabel);
      this.paramContainer.appendChild(knobsGroup);
      index++;
    }
  }
}

let test = new Patch();
test.loadModules([
  new Tone.Noise(),
  new Tone.Filter()
]);

test.addConnect(test.modules[0],
                test.modules[1])

test.modules[0].start();
test.modules[1].toDestination();
