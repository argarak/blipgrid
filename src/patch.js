import * as Tone from 'tone';

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
      let template = `<label for="knobsGroup${index}">${module.constructor.name}</label>
                      <div id="knobsGroup${index}" class="knobSet">
                        <ui-knob value="0"  marker="#66BB6A" label="attack"></ui-knob>
                        <ui-knob value="50" marker="#29B6F6" label="decay"></ui-knob>
                        <ui-knob value="25" marker="#FFA726" label="sustain"></ui-knob>
                        <ui-knob value="10" marker="#EC407A" label="release"></ui-knob>
                      </div>`;
      this.paramContainer.innerHTML += template;
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
