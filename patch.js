import * as Tone from "tone";
import * as moduleControls from "./objects/module-controls.json";

const modulesTable = {
    "FrequencyEnvelope": Tone.FrequencyEnvelope,
    "Oscillator": Tone.Oscillator,
    "AmplitudeEnvelope": Tone.AmplitudeEnvelope,
    "Noise": Tone.Noise,
    "Filter": Tone.Filter
};

class Patch {
    constructor(patchObject) {
        this.modules = [];
        this.connects = [];

        this.paramContainer = document.getElementById("paramContainer");

        if (!patchObject) return;

        // -- load patch object --
        // load modules
        for (let moduleObject of patchObject.modules) {
            let module = new modulesTable[moduleObject.type]();

            if (moduleObject.start) module.start();
            if (moduleObject.toDestination) module.toDestination();

            this.addModule(module);
        }

        // connect modules
        // FIXME :: ids are currently the index of the modules array
        // this should not be the case. we need a lookup method and
        // probably store each module as part of an object w/ id
        for (let connectObject of patchObject.connects) {
            let input;
            if (connectObject.input.property) {
                input = this.modules[connectObject.input.id][
                    connectObject.input.property];
            } else {
                input = this.modules[connectObject.input.id];
            }

            let output;
            if (connectObject.output.property) {
                output = this.modules[connectObject.output.id][
                    connectObject.output.property];
            } else {
                output = this.modules[connectObject.output.id];
            }

            this.addConnect(input, output);
        }

        // set defaults
        for (let defaultObject of patchObject.defaults) {
            this.modules[defaultObject.id][defaultObject.property] =
                defaultObject.value;
        }

        this.updateControls();
    }

    addModule(module) {
        this.modules.push(module);
    }

    loadModules(modulesList) {
        this.modules = modulesList;
        this.updateControls();
    }

    addConnect(input, output) {
        input.connect(output);
        this.connects.push([input, output]);
    }

    onControlInput(e, module, control) {
        let target = e.target;
        if (typeof module[control.property] === "object") {
            module[control.property].value = target.value;
            return;
        }
        module[control.property] = target.value;
    }

    createControlElement(module, control) {
        if (control.type == "knob") {
            let knob = document.createElement("ui-knob");
            knob.setAttribute("min", control.min);
            knob.setAttribute("max", control.max);
            knob.setAttribute("default", control.default);
            knob.setAttribute("label", control.label);

            knob.addEventListener("input", e =>
                this.onControlInput(e, module, control));

            return knob;
        }

        if (control.type == "select") {
            let select = document.createElement("select");

            for (let option of control.select) {
                let optionElement = document.createElement("option");
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            }

            select.addEventListener("input", e =>
                this.onControlInput(e, module, control));

            return select;
        }
    }

    updateControls() {
        this.paramContainer.innerHTML = "";

        let index = 0;
        for (let module of this.modules) {
            // for some reason, the module name can have a underscore at the start,
            // if it does, then we slice it off
            let moduleName = module.name;

            let groupLabel = document.createElement("label");
            groupLabel.setAttribute("for", `knobsGroup${index}`);
            groupLabel.innerText = moduleName;

            let knobsGroup = document.createElement("div");
            knobsGroup.id = `knobsGroup${index}`;
            knobsGroup.classList.add("knobSet");

            knobsGroup.appendChild(groupLabel);

            let controls = moduleName in moduleControls ?
                moduleControls[moduleName] : [];

            for (let control of controls) {
                knobsGroup.appendChild(
                    this.createControlElement(module, control)
                );
            }

            this.paramContainer.appendChild(knobsGroup);
            index++;
        }
    }
}

export default Patch;
