import localforage from "localforage";

class SaveManager {
    constructor() {}

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
