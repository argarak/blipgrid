import Mixer from "./mixer";

export default class State {
    static stateCache = {};

    static sequencer() {
        const key = "sequencer";
        if (!(key in this.stateCache)) {
            this.stateCache[key] = document.querySelector("ui-sequencer");
        }
        return this.stateCache[key];
    }

    static arpeggiator() {
        const key = "arpeggiator";
        if (!(key in this.stateCache)) {
            this.stateCache[key] = document.querySelector("ui-arpeggiator");
        }
        return this.stateCache[key];
    }

    static editView() {
        const key = "editView";
        if (!(key in this.stateCache)) {
            this.stateCache[key] = document.querySelector("ui-edit-view");
        }
        return this.stateCache[key];
    }

    static mixer() {
        const key = "mixer";
        if (!(key in this.stateCache)) {
            this.stateCache[key] = new Mixer();
        }
        return this.stateCache[key];
    }

    static set(key, instance) {
        if (key in this.stateCache) {
            console.error("keys may only be set one time");
            return;
        }
        this.stateCache[key] = instance;
    }

    static get(key) {
        if (!(key in this.stateCache)) {
            console.error(`key ${key} not found`);
            return null;
        }
        return this.stateCache[key];
    }
}
