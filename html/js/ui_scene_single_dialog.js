class UI_SCENE_SINGLE_DIALOG extends HTMLElement
{
    constructor()
    {
        super();
        this.data = {
            scene: null,
        };
        this.initialized = false;
        this.rendered = false;
    }
    initialize()
    {
        if (!this.initialized)
        {
            this.initialized = true;
            this.rendered = false;
            this.data.scene = new GAME_DATA_SCENE_SINGLE_DIALOG(wasm.exports);
            this.render();
        }
    }
    render()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var qs = `document.querySelector('ui-scene-single-dialog')`;
        var dialog_id = wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION"));
        var game_string = GAME_STRINGS[dialog_id];
        if (!STRINGS[game_string])
        {
            console.error(`Could not find string in strings [${game_string}]`);
        }
        var html = `
        <div id="scene_single_dialog" class="popup topleft">
            <div class="outer_border">
                <div class="inner_text">
                    ${STRINGS[game_string]}
                </div>
                <div id="dialog_choices">
                    <button
                        class="positive"
                        onclick="${qs}.exit();"
                    >Ok</button>
                </div>
            </div>
        </div>
        `;
        this.innerHTML = html;
    }
    exit()
    {
        this.rendered = false;
        this.initialized = false;
        this.innerHTML = ``;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_CONFIRM"));
    }
}
customElements.define("ui-scene-single-dialog", UI_SCENE_SINGLE_DIALOG);