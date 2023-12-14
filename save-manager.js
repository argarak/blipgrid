import State from "/state";
import localforage from "localforage";

class SaveManager {
    constructor() {}

    static projectName = "new project";
    static author = "";
    static saveVersion = 0;

    static saveProject() {
        const project = {};

        const sequencer = State.get("sequencer");
        const arpeggiator = State.get("arpeggiator");

        project["name"] = this.projectName;
        project["author"] = this.author;
        project["date"] = Date.now();
        project["version"] = this.saveVersion;

        project["root"] = arpeggiator.root;
        project["scale"] = arpeggiator.scale;
        project["sequencer"] = sequencer.saveState();
        project["arpeggiator"] = arpeggiator.saveState();
        project["patch"] = sequencer.savePatchState();
        project["controls"] = sequencer.saveControlState();

        this.downloadObject(project, `${this.projectName}.blip`);
    }

    static downloadObject(obj, filename) {
        let blob = new Blob([JSON.stringify(obj, null, 2)], {
            type: "application/json",
        });
        this.download(blob, filename);
    }

    static download(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.style.display = "none";
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);

        anchor.click();
        window.URL.revokeObjectURL(url);
        anchor.remove();
    }
}

export default SaveManager;
