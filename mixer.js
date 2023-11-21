import * as Tone from "tone";

class Mixer {
    constructor(numTracks) {
        this.gainNodes = [];
        this.soloChannel = null;

        for (let track = 0; track < numTracks; track++) {
            let gainNode = new Tone.Gain(1).toDestination();
            this.gainNodes.push(gainNode);
        }
    }

    attach(channel, module) {
        module.connect(this.gainNodes[channel]);
    }

    toggleMute(channel) {
        let gain = this.gainNodes[channel].gain.value;
        this.gainNodes[channel].gain.value = gain === 0 ? 1 : 0;
    }

    toggleSolo(channel) {
        console.debug(channel, this.soloChannel);
        // gives solo action toggle like behaviour
        // i.e. if you solo twice, you unmute all
        if (this.soloChannel === channel) {
            this.unmuteAll();
            this.soloChannel = null;
            return;
        }
        this.soloChannel = channel;

        for (let channelIndex = 0;
            channelIndex < this.gainNodes.length;
            channelIndex++) {
            if (channelIndex === channel) this.gainNodes[channel].gain.value = 1;
            else this.gainNodes[channelIndex].gain.value = 0;
        }
    }

    unmuteAll() {
        for (let channelIndex = 0;
            channelIndex < this.gainNodes.length;
            channelIndex++) {
            this.gainNodes[channelIndex].gain.value = 1;
        }
    }
}

export default Mixer;
