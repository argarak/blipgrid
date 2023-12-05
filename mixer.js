import * as Tone from "tone";

class Mixer {
    constructor(sequencer) {
        this.channels = [];
        this.soloChannel = null;
        this.sequencer = sequencer;

        this.delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();

        for (let track = 0; track < sequencer.numTracks; track++) {
            let channel = new Tone.Channel().toDestination();

            if (track === 0) {
                channel.connect(this.delay);
            }

            this.channels.push(channel);
        }
    }

    attach(channel, module) {
        module.connect(this.channels[channel]);
    }

    toggleMute(channel) {
        this.channels[channel].mute = !this.channels[channel].muted;
        this.sequencer.setMute(channel, this.channels[channel].muted);
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
            channelIndex < this.channels.length;
            channelIndex++) {
            if (channelIndex === channel) {
                this.channels[channel].mute = false;
                this.sequencer.setSolo(channel, true);
            } else {
                this.channels[channelIndex].mute = true;
                this.sequencer.setSolo(channelIndex, false);
            }
        }
        this.sequencer.requestUpdate();
    }

    unmuteAll() {
        for (let channelIndex = 0;
            channelIndex < this.channels.length;
            channelIndex++) {
            this.channels[channelIndex].mute = false;
            this.sequencer.setMute(channelIndex, false);
            this.sequencer.setSolo(channelIndex, false);
        }
        this.sequencer.requestUpdate();
    }
}

export default Mixer;
