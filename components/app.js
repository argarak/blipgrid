import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import * as appStyle from "/styles/components/app.styl?inline";

import * as Tone from "tone";

import State from "/scripts/state";
import Patch from "/scripts/patch";
import SaveManager from "/scripts/save-manager";
import KeyHandler, { onInputBlur, onInputFocus } from "/scripts/keys";

import * as themes from "/objects/themes.json";

import * as basicPatch from "/objects/patches/basic.json";
import * as basicSynthPatch from "/objects/patches/basic-synth.json";
import localforage from "localforage";

const defaultLightTheme = "default-light";
const defaultDarkTheme = "default-dark";

class App extends LitElement {
    sequencer = createRef();
    arpeggiator = createRef();
    editView = createRef();

    static properties = {
        projectName: { type: String, state: true },
    };

    _onPlayClick(e) {
        let btnPlay = e.target;

        Tone.start();
        Tone.Transport.toggle();
        if (Tone.Transport.state === "started") btnPlay.classList.add("active");
        else btnPlay.classList.remove("active");
    }

    displayWelcome() {
        this.welcomeDialog = document.createElement("ui-welcome-dialog");
        document.body.appendChild(this.welcomeDialog);
    }

    _onWelcomeClick(e) {
        e.target.blur();
        this.displayWelcome();
    }

    _onDownloadClick(e) {
        e.target.blur();
        SaveManager.downloadProject();
    }

    _onUploadClick(e) {
        e.target.blur();
        SaveManager.uploadProject();
    }

    _onProjectClick(e) {
        e.target.blur();
        const projectSettingsDialog = document.createElement(
            "ui-project-settings-dialog",
        );
        document.body.appendChild(projectSettingsDialog);
    }

    updateProjectName(projectName) {
        this.projectName = projectName;
        document.title = `${projectName} | blipgrid`;
    }

    render() {
        const dropmenu = html`
            <div class="dropmenu" aria-label="submenu">
                <button>
                    <span class="material-icons">add</span> New
                </button>
                <button>
                    <span class="material-icons">save</span> Save to
                    Browser
                </button>
                <button>
                    <span class="material-icons">file_open</span>
                    Load from Browser
                </button>
                <button @click=${this._onDownloadClick}>
                    <span class="material-icons">download</span>
                    Download
                </button>
                <button @click=${this._onUploadClick}>
                    <span class="material-icons">upload</span>
                    Upload
                </button>
                </hr>
                <button @click=${this._onProjectClick}>
                    <span class="material-icons">settings_applications</span>
                    Project Settings
                </button>
                <button @click=${this._onWelcomeClick}>
                    <span class="material-icons">web_asset</span>
                    Welcome Screen
                </button>
            </div>
       `;

        return html`
            <div id="mainContainer">
                <div id="headContainer">
                    <div class="headLeft">
                        <div class="dropdown" aria-haspopup="true">
                            <div class="droplabel" tabindex="0">
                                Action
                                <span class="material-icons"
                                    >arrow_drop_down</span
                                >
                            </div>
                            ${dropmenu}
                        </div>
                    </div>

                    <div class="headCenter">
                        <button
                            class="editProject"
                            @click=${this._onProjectClick}
                        >
                            <div class="projectName">${this.projectName}</div>
                            <span class="material-icons">edit</span>
                        </button>
                    </div>

                    <div class="headRight">
                        <button
                            class="btn"
                            id="btnPlay"
                            @click=${this._onPlayClick}
                        >
                            <span class="material-icons">play_arrow</span>
                        </button>
                        <button class="btn" id="btnLoop">
                            <span class="material-icons">repeat</span>
                        </button>
                        <button class="btn" id="btnStop">
                            <span class="material-icons">stop</span>
                        </button>
                    </div>
                </div>

                <div id="editContainer">
                    <div id="sequencerContainer">
                        <ui-sequencer ${ref(this.sequencer)}></ui-sequencer>
                        <ui-arpeggiator
                            ${ref(this.arpeggiator)}
                        ></ui-arpeggiator>
                    </div>
                    <div id="paramContainer">
                        <ui-edit-view ${ref(this.editView)}></ui-edit-view>
                    </div>
                </div>
            </div>
        `;
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(appStyle.default)}
        `,
    ];

    firstUpdated() {
        State.set("sequencer", this.sequencer.value);
        State.set("arpeggiator", this.arpeggiator.value);
        State.set("editView", this.editView.value);

        const mixer = State.mixer();

        //this.displayWelcome();
        KeyHandler.start();

        localforage.getItem("theme").then((value) => {
            if (value) {
                State.setTheme(value);
                return;
            }

            if (
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
                localforage.setItem("theme", defaultDarkTheme);
                State.setTheme(defaultDarkTheme);
                this.welcomeDialog.selectedTheme = defaultDarkTheme;
            } else {
                localforage.setItem("theme", defaultLightTheme);
                State.setTheme(defaultLightTheme);
                this.welcomeDialog.selectedTheme = defaultLightTheme;
            }
        });

        document.addEventListener("projectChange", (e) => {
            if (!e.detail) return;
            if (e.detail.property === "projectName") {
                this.updateProjectName(e.detail.value);
            }
        });

        document.addEventListener("trackSwitch", (e) => {
            let track = e.detail;
            this.editView.value.registerTrack(track);
            this.arpeggiator.value.switchTrack(e.detail.index);
        });

        for (
            let trackIndex = 0;
            trackIndex < this.sequencer.value.numTracks;
            trackIndex++
        ) {
            let patch = new Patch(
                trackIndex % 2 == 0
                    ? basicSynthPatch.default
                    : basicPatch.default,
                trackIndex,
            );
            this.sequencer.value.assignPatch(trackIndex, patch);
            if (trackIndex === this.sequencer.value.selectedTrack) {
                this.editView.value.registerTrack(
                    this.sequencer.value.sequence[trackIndex],
                );
            }
        }

        function setFrequency(modules, frequency, time) {
            for (let module of modules) {
                if (module.name === "Oscillator" && !module.independent)
                    module.frequency.setValueAtTime(frequency, time);
            }
        }

        function trigger(modules, time) {
            for (let module of modules) {
                if (module.name === "AmplitudeEnvelope")
                    module.triggerAttack(time);
                if (module.name === "FrequencyEnvelope")
                    module.triggerAttack(time);
                if (module.name === "Envelope") module.triggerAttack(time);
            }
        }

        // FIXME currently the keys "roll", as is default OS behaviour
        // not sure whether we should deal with it somehow
        KeyHandler.registerKey("a", [], () => {
            let modules = this.sequencer.value.getCurrentTrack().patch.modules;
            let time = Tone.now();
            setFrequency(modules, Tone.Frequency(60, "midi"), time);
            trigger(modules, time);
        });

        KeyHandler.registerKey("KeyQ", [], () => {
            this.editView.value.switchView(this.editView.value.views[0]);
        });

        KeyHandler.registerKey("KeyW", [], () => {
            this.editView.value.switchView(this.editView.value.views[1]);
        });

        KeyHandler.registerKey("KeyE", [], () => {
            this.editView.value.switchView(this.editView.value.views[2]);
        });

        KeyHandler.registerKey("KeyR", [], () => {
            this.editView.value.switchView(this.editView.value.views[3]);
        });

        for (
            let trackIndex = 1;
            trackIndex <= this.sequencer.value.numTracks;
            trackIndex++
        ) {
            KeyHandler.registerKey(`Digit${trackIndex}`, ["shift"], () => {
                console.debug(`muting channel ${trackIndex - 1}`);
                mixer.toggleMute(trackIndex - 1);
            });

            KeyHandler.registerKey(`Digit${trackIndex}`, ["ctrl"], () => {
                console.debug(`soloing channel ${trackIndex - 1}`);
                mixer.toggleSolo(trackIndex - 1);
            });

            KeyHandler.registerKey(`Digit${trackIndex}`, [], () => {
                console.debug(`switching to track ${trackIndex - 1}`);
                this.sequencer.value.switchTrack(trackIndex - 1);
            });
        }

        Tone.Transport.scheduleRepeat((time) => {
            let t = this.sequencer.value.nextStep();

            for (
                let trackIndex = 0;
                trackIndex < this.sequencer.value.numTracks;
                trackIndex++
            ) {
                let trig = this.sequencer.value.next(trackIndex);
                if (trig) {
                    let frequency = this.arpeggiator.value.next(
                        trackIndex,
                        t % this.sequencer.value.sequence[trackIndex].length,
                    );
                    setFrequency(
                        this.sequencer.value.sequence[trackIndex].patch.modules,
                        frequency,
                        time,
                    );
                    trigger(
                        this.sequencer.value.sequence[trackIndex].patch.modules,
                        time,
                    );
                }
            }
        }, "16n");
    }

    constructor() {
        super();
        this.updateProjectName(SaveManager.projectName);
        this.welcomeDialog = null;
    }
}

customElements.define("ui-app", App);
export default App;
