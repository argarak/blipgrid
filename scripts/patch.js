import * as Tone from "tone";
import State from "/scripts/state";

import * as moduleControls from "/objects/module-controls.json";

const modulesTable = {
    Envelope: Tone.Envelope,
    FrequencyEnvelope: Tone.FrequencyEnvelope,
    Oscillator: Tone.Oscillator,
    AmplitudeEnvelope: Tone.AmplitudeEnvelope,
    Noise: Tone.Noise,
    Filter: Tone.Filter,
};

class Patch {
    constructor(patchObject, track) {
        this.modules = [];
        this.connects = [];
        this.patchObject = null;

        this.mixer = State.mixer();
        this.track = track;

        this.name = patchObject.name ? patchObject.name : "unnamed patch";

        if (!patchObject) return;

        this.loadPatch(patchObject);
    }

    loadPatch(patchObject) {
        // should this be cleared differently? what about garbage collection?
        this.modules = [];
        this.connects = [];
        this.patchObject = patchObject.default;

        let module = null;

        // -- load patch object --
        // load modules
        for (let moduleObject of patchObject.modules) {
            if (!(moduleObject.type in modulesTable)) {
                // TODO: show errors to the user
                console.error(`module ${moduleObject.type} not supported!`);
                return;
            }

            module = new modulesTable[moduleObject.type]();
            module.id = moduleObject.type + "_" + moduleObject.id;

            if (moduleObject.independent) module.independent = true;

            if (moduleObject.toDestination)
                this.mixer.attach(this.track, module);
            if (moduleObject.start) module.start();

            this.addModule(module);
        }

        // connect modules
        // FIXME :: ids are currently the index of the modules array
        // this should not be the case. we need a lookup method and
        // probably store each module as part of an object w/ id
        for (let connectObject of patchObject.connects) {
            let input;
            if (connectObject.input.property) {
                input =
                    this.modules[connectObject.input.id][
                        connectObject.input.property
                    ];
            } else {
                input = this.modules[connectObject.input.id];
            }

            let output;
            if (connectObject.output.property) {
                output =
                    this.modules[connectObject.output.id][
                        connectObject.output.property
                    ];
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
    }

    getControlValue(module, control) {
        if (typeof module[control.property] === "object") {
            return module[control.property].value;
        }
        return module[control.property];
    }

    saveControlState() {
        const state = {};

        for (let module of this.modules) {
            if (!module.id) continue;
            let moduleName = module.name;
            state[module.id] = {};

            let controls =
                moduleName in moduleControls ? moduleControls[moduleName] : [];

            for (let control of controls) {
                state[module.id][control.property] = this.getControlValue(
                    module,
                    control,
                );
            }
        }

        return state;
    }

    loadControlState(state) {
        for (let module of this.modules) {
            let moduleName = module.name;
            let controlValues = state[module.id];

            let controls =
                moduleName in moduleControls ? moduleControls[moduleName] : [];

            for (let control of controls) {
                const properties = {};
                properties[control.property] = controlValues[control.property];
                module.set(properties);
            }
        }
    }

    addModule(module) {
        this.modules.push(module);
    }

    loadModules(modulesList) {
        this.modules = modulesList;
        this.drawControls();
    }

    addConnect(input, output) {
        input.connect(output);
        this.connects.push([input, output]);
    }
}

export default Patch;
