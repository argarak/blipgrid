import * as Tone from "tone";

import State from "/scripts/state";
import localforage from "localforage";

class SaveManager {
    constructor() {}

    static projectName = "new project";
    static author = "";
    static description = "";
    static saveVersion = 0;

    static projectFileType = ".blip";

    static saveProject() {
        const project = {};

        const sequencer = State.get("sequencer");
        const arpeggiator = State.get("arpeggiator");
        const mixer = State.get("mixer");

        project["name"] = this.projectName;
        project["author"] = this.author;
        project["date"] = Date.now();
        project["version"] = this.saveVersion;
        project["bpm"] = Tone.Transport.bpm.value;
        project["swing"] = Tone.Transport.swing;

        project["root"] = arpeggiator.root;
        project["scale"] = arpeggiator.scale;
        project["sequencer"] = sequencer.saveState();
        project["arpeggiator"] = arpeggiator.saveState();
        project["patch"] = sequencer.savePatchState();
        project["controls"] = sequencer.saveControlState();
        project["mixer"] = mixer.saveState();

        return project;
    }

    static downloadProject() {
        this.downloadObject(this.saveProject(), `${this.projectName}.blip`);
    }

    static loadProject(project) {
        if (project.version > this.saveVersion) {
            // error (version is too new to load!)
            return;
        }

        const sequencer = State.get("sequencer");
        const arpeggiator = State.get("arpeggiator");

        this.projectName = project.name;
        this.author = project.author;

        let inputEvent = new CustomEvent("projectChange", {
            detail: { property: "projectName", value: this.projectName },
        });
        document.dispatchEvent(inputEvent);

        inputEvent = new CustomEvent("projectChange", {
            detail: { property: "author", value: this.author },
        });
        document.dispatchEvent(inputEvent);

        Tone.Transport.stop();

        Tone.Transport.bpm.value = 120;
        Tone.Transport.swing = 0;

        if (project["bpm"]) {
            Tone.Transport.bpm.value = project["bpm"];
        }

        if (project["swing"]) {
            Tone.Transport.swing = project["swing"];
        }

        arpeggiator.loadState(
            project["root"],
            project["scale"],
            project["arpeggiator"],
        );

        sequencer.loadState(
            project["patch"],
            project["controls"],
            project["sequencer"],
        );
    }

    static uploadProject() {
        this.upload(this.projectFileType, (result) => {
            let project = JSON.parse(result);
            if (!project) {
                // error here
                return;
            }
            this.loadProject(project);
        });
    }

    static downloadObject(obj, filename) {
        let blob = new Blob([JSON.stringify(obj, null, 2)], {
            type: "application/json",
        });
        this.download(blob, filename);
    }

    static upload(mimetype, callback) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = mimetype;

        // TODO errors should show up in some dialog box
        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length === 0 || e.target.files.length > 1) {
                // error: select one file
            }

            if (e.target.files[0].size > 10e6) {
                // error: file too large
            }

            let reader = new FileReader();

            reader.onload = () => {
                callback(reader.result);
            };

            reader.readAsText(e.target.files[0]);
        });

        fileInput.click();
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
