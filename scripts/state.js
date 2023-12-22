import localforage from "localforage";
import Mixer from "./mixer";
import SaveManager from "./save-manager";
import * as themes from "/objects/themes.json";

export default class State {
    static stateCache = {};

    static setTheme(theme) {
        for (let key of Object.keys(themes.default[theme])) {
            document.documentElement.style.setProperty(
                key,
                themes.default[theme][key],
            );
        }
        localforage.setItem("theme", theme).catch((err) => console.error(err));
    }

    static cacheValue(key, fn) {
        if (!(key in this.stateCache)) {
            this.stateCache[key] = fn();
        }
        return this.stateCache[key];
    }

    static sequencer() {
        return this.cacheValue("sequencer", () =>
            document.querySelector("ui-sequencer"),
        );
    }

    static arpeggiator() {
        return this.cacheValue("arpeggiator", () =>
            document.querySelector("ui-arpeggiator"),
        );
    }

    static editView() {
        return this.cacheValue("editView", () =>
            document.querySelector("ui-edit-view"),
        );
    }

    static mixer() {
        return this.cacheValue("mixer", () => new Mixer());
    }

    static saveManager() {
        return this.cacheValue("saveManager", () => new SaveManager());
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
