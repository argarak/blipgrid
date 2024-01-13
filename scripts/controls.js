export default class ControlUtil {
    static getControlValue(module, control) {
        if (typeof module[control.property] === "object") {
            return module[control.property].value;
        }
        return module[control.property];
    }

    static createControlElement(module, control, inputCallback) {
        if (control.type == "knob") {
            let knob = document.createElement("ui-knob");
            knob.setAttribute("min", control.min);
            knob.setAttribute("max", control.max);
            knob.setAttribute("default", this.getControlValue(module, control));

            if (control.integerMode) knob.setAttribute("integer-mode", true);
            if (control.nonlinear) knob.setAttribute("nonlinear", true);
            knob.setAttribute("label", control.label);

            knob.addEventListener("input", (e) =>
                inputCallback(e, module, control),
            );

            return knob;
        }

        if (control.type == "select") {
            let selectContainer = document.createElement("div");
            selectContainer.classList.add("selectContainer");

            let selectLabel = document.createElement("label");
            selectLabel.textContent = control.label;
            selectLabel.classList.add("selectLabel");

            let select = document.createElement("select");

            for (let option of control.select) {
                let optionElement = document.createElement("option");
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            }

            select.value = this.getControlValue(module, control);

            select.addEventListener("input", (e) =>
                inputCallback(e, module, control),
            );

            selectContainer.appendChild(select);
            selectContainer.appendChild(selectLabel);

            return selectContainer;
        }
    }
}
