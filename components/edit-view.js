import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import * as editViewStyle from "/styles/components/edit-view.styl?inline";

class EditView extends LitElement {
    editPatch = createRef();
    editMix = createRef();
    editEffect = createRef();
    editModulation = createRef();

    static properties = {};

    render() {
        return html` <div id="viewTabs">${this.viewTabs}</div>
            <div id="editViewContainer">
                <ui-edit-patch ${ref(this.editPatch)}></ui-edit-patch>
                <ui-edit-mix ${ref(this.editMix)}></ui-edit-mix>
                <ui-edit-effect ${ref(this.editEffect)}></ui-edit-effect>
            </div>`;

        // <ui-edit-modulation ${ref(this.editModulation)}></ui-edit-modulation>
    }

    static styles = [
        css`
            ${unsafeCSS(mdiStyle.default)}
        `,
        css`
            ${unsafeCSS(editViewStyle.default)}
        `,
    ];

    constructor() {
        super();
        this.ready = false;
        this.track = null;
        this.views = [
            {
                name: "sound",
                icon: "cable",
                active: true,
                viewElement: this.editPatch,
            },
            {
                name: "edit/mix",
                icon: "tune",
                active: false,
                viewElement: this.editMix,
            },
            {
                name: "effect",
                icon: "blur_on",
                active: false,
                viewElement: this.editEffect,
            },
            // {
            //     name: "modulation",
            //     icon: "graphic_eq",
            //     active: false,
            //     viewElement: this.editModulation,
            // },
        ];
        this.viewTabs = this.createTabs();
    }

    firstUpdated() {
        this.ready = true;
        if (this.track) this.editPatch.value.registerTrack(this.track);
        this.switchView(this.views[0]);
    }

    registerTrack(track) {
        this.track = track;
        if (this.ready) {
            this.editPatch.value.registerTrack(track);
        }
    }

    switchView(newView) {
        let viewIndex = -1;
        for (let view of this.views) {
            viewIndex++;
            if (!view.viewElement || !view.viewElement.value) {
                continue;
            }

            if (view === newView) {
                view.viewElement.value.style.display = "flex";
                this.viewTabs[viewIndex].classList.add("active");
                continue;
            }

            view.viewElement.value.style.display = "none";
            this.viewTabs[viewIndex].classList.remove("active");
        }
    }

    createTabs() {
        let tabs = [];

        for (let view of this.views) {
            let tab = document.createElement("div");
            tab.classList.add("tab");

            if (view.active) tab.classList.add("active");

            let icon = document.createElement("span");
            icon.classList.add("material-icons");
            icon.innerText = view.icon;
            tab.appendChild(icon);

            let content = document.createTextNode(` ${view.name}`);
            tab.appendChild(content);

            tab.addEventListener("click", () => this.switchView(view));

            tabs.push(tab);
        }

        return tabs;
    }
}

customElements.define("ui-edit-view", EditView);
export default EditView;
