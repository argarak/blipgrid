// TODO use keynames
// TODO add support for shift, ctrl, alt modifiers

class KeyHandler {
    constructor() {
        this.registeredKeys = [];
        this.currentlyPressed = [];

        let self = this;

        document.addEventListener("keydown", e => {
            self.handleKeyDown(e);
        });

        document.addEventListener("keydown", e => {
            self.handleKeyUp(e);
        });
    }

    handleKeyUp(e) {
        // remove the keys from currentlyPressed
        this.currentlyPressed = this.currentlyPressed.filter(kp => kp !== e.key);
    }

    handleKeyDown(e) {
        if (this.currentlyPressed.includes(e.key)) return;

        // add the key into currentlyPressed
        this.currentlyPressed.push(e.key);

        for (let registeredKey of this.registeredKeys) {
            if (registeredKey.keys.length !==
                this.currentlyPressed.length) continue;

            let keyIndex = 0;
            while (registeredKey.keys[keyIndex].toLowerCase() ===
                   this.currentlyPressed[keyIndex].toLowerCase()) {
                keyIndex++;

                if (keyIndex === registeredKey.keys.length) {
                    e.preventDefault();
                    registeredKey.fn();
                    this.currentlyPressed = [];
                    break;
                }
            }
        }
    }

    registerKey(keys, fn) {
        this.registeredKeys.push({
            "keys": keys,
            "fn": fn
        });
    }
}

let keyHandler = new KeyHandler();

export default keyHandler;
