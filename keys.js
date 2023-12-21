export default class KeyHandler {
    static registeredKeys = [];
    static paused = false;

    static start() {
        document.addEventListener("keydown", (e) => {
            this.handleKeyDown(e);
        });
    }

    static pause() {
        console.debug("pausing key handler");
        this.paused = true;
    }

    static resume() {
        console.debug("resuming key handler");
        this.paused = false;
    }

    static handleKeyDown(e) {
        console.debug(e.target, this.paused);
        if (e.target !== document.body && this.paused) return;
        let keyCombinations = this.registeredKeys.filter(
            (kp) => kp.key === e.code,
        );
        for (let combination of keyCombinations) {
            let mod = 0;
            if (combination.mod.includes("shift"))
                mod = e.shiftKey ? mod + 1 : mod;
            if (combination.mod.includes("ctrl"))
                mod = e.ctrlKey ? mod + 1 : mod;
            if (combination.mod.includes("alt")) mod = e.altKey ? mod + 1 : mod;
            console.debug(combination, mod);
            e.preventDefault();
            if (mod === combination.mod.length) {
                combination.fn();
                return;
            }
        }
    }

    static registerKey(key, mod, fn) {
        this.registeredKeys.push({
            key: key,
            mod: mod,
            fn: fn,
        });
    }
}

export const onInputFocus = () => {
    KeyHandler.pause();
};

export const onInputBlur = () => {
    KeyHandler.resume();
};
