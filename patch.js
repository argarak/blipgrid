import * as moduleControls from "./objects/module-controls.json";

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
        let index = 0;
        for (let module of this.modules) {
            // for some reason, the module name can have a underscore at the start,
            // if it does, then we slice it off
            let moduleName = module.constructor.name.startsWith("_") ?
                module.constructor.name.slice(1) : module.constructor.name;

            let groupLabel = document.createElement("label");
            groupLabel.setAttribute("for", `knobsGroup${index}`);
            groupLabel.innerText = moduleName;

            let knobsGroup = document.createElement("div");
            knobsGroup.id = `knobsGroup${index}`;
            knobsGroup.classList.add("knobSet");

            let controls = moduleName in moduleControls ?
                moduleControls[moduleName] : [];

            for (let control of controls) {
                knobsGroup.appendChild(
                    this.createControlElement(module, control)
                );
            }

            this.paramContainer.appendChild(groupLabel);
            this.paramContainer.appendChild(knobsGroup);
            index++;
        }
    }
}

export default Patch;
