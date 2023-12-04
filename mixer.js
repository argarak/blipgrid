import * as Tone from "tone";

class Mixer {
    constructor(sequencer) {
        this.gainNodes = [];
        this.soloChannel = null;
        this.sequencer = sequencer;

        this.delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();

        for (let track = 0; track < sequencer.numTracks; track++) {
            let gainNode = new Tone.Gain(1).toDestination();

            if (track === 0) {
                gainNode.connect(this.delay);
            }

            this.gainNodes.push(gainNode);
        }
    }

    attach(channel, module) {
        module.connect(this.gainNodes[channel]);
    }

    toggleMute(channel) {
        let toggle = this.gainNodes[channel].gain.value === 0;
        this.gainNodes[channel].gain.value = toggle ? 1 : 0;
        this.sequencer.setMute(channel, !toggle);
        this.sequencer.requestUpdate();
    }

    toggleSolo(channel) {
        console.debug(channel, this.soloChannel);
        // gives solo action toggle like behaviour
        // i.e. if you solo twice, you unmute all
        if (this.soloChannel === channel) {
            this.unmuteAll();
            this.sequencer.setSolo(this.soloChannel, false);
            this.soloChannel = null;
            return;
        }
        this.soloChannel = channel;

        for (let channelIndex = 0;
            channelIndex < this.gainNodes.length;
            channelIndex++) {
            if (channelIndex === channel) {
                this.gainNodes[channel].gain.value = 1;
                this.sequencer.setSolo(channel, true);
            } else {
                this.gainNodes[channelIndex].gain.value = 0;
                this.sequencer.setSolo(channelIndex, false);
            }
        }
        this.sequencer.requestUpdate();
    }

    unmuteAll() {
        for (let channelIndex = 0;
            channelIndex < this.gainNodes.length;
            channelIndex++) {
            this.gainNodes[channelIndex].gain.value = 1;
            this.sequencer.setMute(channelIndex, false);
            this.sequencer.setSolo(channelIndex, false);
        }
        this.sequencer.requestUpdate();
    }
}

export default Mixer;
