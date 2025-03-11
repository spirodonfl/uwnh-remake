// -----------------------------------------------------------------
// - UI SCENE SINGLE DIALOG
// -----------------------------------------------------------------
// TODO: Actually need a few html renders
// - initial screen (set sail, supply)
// - set sail = show how many days you can sail then say "are you sure"
// - set sail error = not enough food or water to sail
// - supply = show current supplies, supply them, confirm
// - supply errors = not enough money or cargo capacity
// TODO: Real question - how to make supply table look good?
class WC_SCENE_SINGLE_DIALOG extends DEFAULT_WC {};
customElements.define("ui-scene-single-dialog", WC_SCENE_SINGLE_DIALOG);
var UI_SCENE_SINGLE_DIALOG = {};
UI_SCENE_SINGLE_DIALOG.initialize = function ()
{
    if (this.initialized) { return; }
    this.initialized = true;
    this.rendered = false;
    this.data.component = document.querySelector('ui-scene-single-dialog');
    this.render();
};
UI_SCENE_SINGLE_DIALOG.render = function ()
{
    if (this.rendered) { return; }
    this.rendered = true;
    var dialog_id = wasm.exports.scene_single_dialog_get_dialog_id();
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
                        onclick="UI_SCENE_SINGLE_DIALOG.exit();"
                    >Ok</button>
                </div>
            </div>
        </div>
    `;
    this.data.component.updateHTML(html);
}
UI_SCENE_SINGLE_DIALOG.exit = function ()
{
    this.rendered = false;
    this.initialized = false;
    this.data.component.clearHTML();
    wasm.exports.scene_single_dialog_confirm();
}