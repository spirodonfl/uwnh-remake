let globalSheets = null;

export function getGlobalStyleSheets() {
    if (globalSheets === null) {
        globalSheets = Array.from(document.styleSheets)
            .map(x => {
                const sheet = new CSSStyleSheet();
                const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
                sheet.replaceSync(css);
                return sheet;
            });
    }

    return globalSheets;
}

export function addGlobalStylesToShadowRoot(shadowRoot) {
    shadowRoot.adoptedStyleSheets.push(
        ...getGlobalStyleSheets()
    );
}

export const globalStyles = `
    <style>
    .hidden {
        /*display: none !important;*/
        visibility: hidden !important;
    }
    .two-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 1em 0em;
        align-items: center;
    }
    .title {
        text-align: center;
        font-size: 1.5em;
    }
    input[type="button"] {
        cursor: pointer;
    }
    input {
        border: 2px solid rgb(158 158 158);
        padding: 0.8em;
        padding-top: 0.5em;
        padding-bottom: 0.5em;
        width: 100%;
        background-color: transparent;
        color: white;
        border-radius: 4px;

        margin-top: 1em;
        text-transform: uppercase;
    }
    .main-content {
        padding: 0.7em;
    }
    .text-shadow {
        text-shadow: 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black;
    }
    .auto-cols {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
    }
    .small-button {
        cursor: pointer;
        padding: 0.5em;
        margin: 0.5em;
        border: 2px solid rgb(158 158 158);
        background-color: transparent;
        color: white;
        border-radius: 4px;
        text-align: center;
        text-transform: uppercase;
    }
    </style>
`;