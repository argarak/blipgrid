import * as mdiStyle from "@material-design-icons/font/index.css?inline";
import { LitElement, html, css, unsafeCSS } from "lit";
import * as editViewStyle from "/styles/components/editView.styl?inline";

class EditView extends LitElement {
    static properties = {};

    render() {
        return html`
        <div id="viewTabs">
            ${this.viewTabs}
        </div>`;
    }

    static styles = [
        css`${unsafeCSS(mdiStyle.default)}`,
        css`${unsafeCSS(editViewStyle.default)}`
    ];

    constructor() {
        super();
        this.views = [
            {
                name: "sound",
                icon: "cable",
                active: true
            },
            {
                name: "edit/mix",
                icon: "tune",
                active: false
            },
            {
                name: "effect",
                icon: "blur_on",
                active: false
            },
            {
                name: "modulation",
                icon: "graphic_eq",
                active: false
            }
        ];
        this.viewTabs = this.createTabs();
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

            tab.addEventListener("click", e => console.log(e));

            tabs.push(tab);
        }

        return tabs;
    }

}

customElements.define("ui-edit-view", EditView);
export default EditView;