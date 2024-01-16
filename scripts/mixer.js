import State from "/scripts/state.js";
import * as Tone from "tone";

class Mixer {
    constructor() {
        this.channels = [];
        this.soloChannel = null;
        this.sequencer = State.sequencer();

        this.chorus = new Tone.Chorus({
            wet: 1,
        })
            .toDestination()
            .start();
        this.chorusChannel = new Tone.Channel({ volume: -6 }).connect(
            this.chorus,
        );

        this.cheby = new Tone.Chebyshev(50).toDestination();
        this.chebyChannel = new Tone.Channel({ volume: -6 }).connect(
            this.cheby,
        );

        this.reverb = new Tone.Reverb(3).toDestination();
        this.reverbChannel = new Tone.Channel({ volume: -6 }).connect(
            this.reverb,
        );

        this.delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
        this.delayChannel = new Tone.Channel({ volume: -6 }).connect(
            this.delay,
        );

        this.modules = [this.chorus, this.cheby, this.reverb, this.delay];

        this.effectChannels = [
            { name: "chorus", channel: this.chorusChannel },
            { name: "chebyshev", channel: this.chebyChannel },
            { name: "reverb", channel: this.reverbChannel },
            { name: "delay", channel: this.delayChannel },
        ];

        this.effectSends = [];

        this.chorusChannel.receive(this.effectChannels[0].name);
        this.chebyChannel.receive(this.effectChannels[1].name);
        this.reverbChannel.receive(this.effectChannels[2].name);
        this.delayChannel.receive(this.effectChannels[3].name);

        for (let track = 0; track < this.sequencer.numTracks; track++) {
            let channel = new Tone.Channel().toDestination();
            let channelSends = {};

            for (let effectChannel of this.effectChannels) {
                let send = channel.send(effectChannel.name, -Infinity);
                channelSends[effectChannel.name] = send;
            }
            this.effectSends.push(channelSends);

            this.channels.push(channel);
        }
    }

    saveState() {
        let state = {};
        let trackIndex = 0;
        for (let channelSend of this.effectSends) {
            state[trackIndex] = {};
            for (const [key, value] of Object.entries(channelSend)) {
                state[trackIndex][key] = value.gain.value;
            }
            trackIndex++;
        }
        return state;
    }

    loadState(state) {
        for (let [trackIndex, effectGains] of Object.entries(state)) {
            const entries = Object.entries(effectGains);

            for (let [effectName, effectGain] of entries) {
                if (!effectGain) {
                    this.effectSends[trackIndex][effectName].gain.value =
                        -Infinity;
                } else {
                    this.effectSends[trackIndex][effectName].gain.value =
                        effectGain;
                }
            }
        }
    }

    attach(channel, module) {
        module.connect(this.channels[channel]);
    }

    toggleMute(channel) {
        this.channels[channel].mute = !this.channels[channel].muted;
        this.sequencer.setMute(channel, this.channels[channel].muted);
        this.sequencer.requestUpdate();

        const muteEvent = new CustomEvent("mute", {
            detail: { channel: channel, muted: this.channels[channel].muted },
        });
        document.dispatchEvent(muteEvent);
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

        for (
            let channelIndex = 0;
            channelIndex < this.channels.length;
            channelIndex++
        ) {
            if (channelIndex === channel) {
                this.channels[channel].mute = false;
                this.sequencer.setSolo(channel, true);
            } else {
                this.channels[channelIndex].mute = true;
                this.sequencer.setSolo(channelIndex, false);
            }
        }
        this.sequencer.requestUpdate();

        const soloEvent = new CustomEvent("solo", {
            detail: { channel: channel },
        });
        document.dispatchEvent(soloEvent);
    }

    unmuteAll() {
        for (
            let channelIndex = 0;
            channelIndex < this.channels.length;
            channelIndex++
        ) {
            this.channels[channelIndex].mute = false;
            this.sequencer.setMute(channelIndex, false);
            this.sequencer.setSolo(channelIndex, false);
        }
        this.sequencer.requestUpdate();
    }
}

export default Mixer;
