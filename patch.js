import * as Tone from "tone";
import * as moduleControls from "./objects/module-controls.json";

const modulesTable = {
    "Envelope": Tone.Envelope,
    "FrequencyEnvelope": Tone.FrequencyEnvelope,
    "Oscillator": Tone.Oscillator,
    "AmplitudeEnvelope": Tone.AmplitudeEnvelope,
    "Noise": Tone.Noise,
    "Filter": Tone.Filter
};

class Patch {
    constructor(patchObject, mixer, track) {
        this.modules = [];
        this.connects = [];

        this.mixer = mixer;
        this.track = track;

        this.name = patchObject.name ? patchObject.name : "unnamed patch";

        let self = this;

        if (!patchObject) return;

        this.loadPatch(patchObject);
    }

    loadPatch(patchObject) {
        // should this be cleared differently? what about garbage collection?
        this.modules = [];
        this.connects = [];

        // -- load patch object --
        // load modules
        for (let moduleObject of patchObject.modules) {
            if (!(moduleObject.type in modulesTable)) {
                // TODO: show errors to the user
                console.error(`module ${moduleObject.type} not supported!`);
                return;
            }

            let module = new modulesTable[moduleObject.type]();

            if (moduleObject.toDestination) this.mixer.attach(this.track, module);
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
    }

    uploadPatch() {
        let self = this;
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "text/json";

        // TODO errors should show up in a some dialog box
        // maybe we need a new component?
        fileInput.addEventListener("change", e => {
            if (e.target.files.length === 0 ||
                e.target.files.length > 1) {
                // error: select one file
            }

            if (e.target.files[0].size > 10e6) {
                // error: file too large
            }

            let reader = new FileReader();

            reader.onload = function () {
                let patchObject = JSON.parse(reader.result);
                self.loadPatch(patchObject);
            };

            reader.readAsText(e.target.files[0]);
        });

        fileInput.click();
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
