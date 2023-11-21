class KeyHandler {
    constructor() {
        this.registeredKeys = [];
        this.paused = false;
        document.addEventListener("keydown", e => {
            this.handleKeyDown(e);
        });
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    handleKeyDown(e) {
        console.debug(e);
        if (this.target !== document.body && this.paused) return;
        let keyCombinations = this.registeredKeys.filter(
            kp => kp.key === e.code
        );
        for (let combination of keyCombinations) {
            let mod = 0;
            if (combination.mod.includes("shift")) mod = e.shiftKey ? mod + 1 : mod;
            if (combination.mod.includes("ctrl")) mod = e.ctrlKey ? mod + 1 : mod;
            if (combination.mod.includes("alt")) mod = e.altKey ? mod + 1 : mod;
            console.debug(combination, mod);
            e.preventDefault();
            if (mod === combination.mod.length) {
                combination.fn();
                return;
            }
        }
    }

    registerKey(key, mod, fn) {
        this.registeredKeys.push({
            "key": key,
            "mod": mod,
            "fn": fn
        });
    }
}

let keyHandler = new KeyHandler();
export default keyHandler;
