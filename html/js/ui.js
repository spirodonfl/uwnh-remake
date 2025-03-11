// -----------------------------------------------------------------
// - UI FUNCTIONS
// -----------------------------------------------------------------
var DEFAULT_INPUT_ACTIONS = "nav-keydown nav-pointerup action-keyup action-pointerup";
function ui_scene_focus_next_element(next)
{
    var next_element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="${next}"]`);
    if (next_element instanceof HTMLElement)
    {
        ui_scene_clear_highlighted_elements();
        next_element.classList.add("hover");
        var style_id = next_element.getAttribute("style-id");
        if (style_id && CURRENT_SCENE.STYLES && CURRENT_SCENE.STYLES[style_id])
        {
            next_element.style.cssText = CURRENT_SCENE.STYLES[style_id].hover();
        }
    }
}
function ui_scene_clear_highlighted_elements()
{
    var hovers = CURRENT_SCENE.COMPONENT.querySelectorAll(".hover");
    for (var i = 0; i < hovers.length; ++i)
    {
        hovers[i].classList.remove("hover");
        var style_id = hovers[i].getAttribute("style-id");
        if (style_id && CURRENT_SCENE.STYLES && CURRENT_SCENE.STYLES[style_id])
        {
            hovers[i].style.cssText = CURRENT_SCENE.STYLES[style_id].default();
        }
    }
}
function ui_scene_run_element_action(current_element)
{
    var data_id = current_element.getAttribute("data-id");
    var action_id = current_element.getAttribute("data-action-id");
    if (CURRENT_SCENE.ACTIONS[data_id])
    {
        CURRENT_SCENE.ACTIONS[data_id]();
    }
    else if (CURRENT_SCENE.ACTIONS[action_id])
    {
        CURRENT_SCENE.ACTIONS[action_id]();
    }
}
function ui_scene_default_input_listener()
{
    var input_event = INPUT_SERVER.getLatestEntry();
    if (!input_event) { return; }
    if (CURRENT_SCENE.LAST_INPUT_MODE !== INPUT_SERVER.input_mode)
    {
        ui_scene_clear_highlighted_elements();
        CURRENT_SCENE.LAST_INPUT_MODE = INPUT_SERVER.input_mode;
        if (CURRENT_SCENE.LAST_INPUT_MODE === "keyboard")
        {
            var default_el = CURRENT_SCENE.DEFAULT_ELEMENT;
            var element = CURRENT_SCENE.COMPONENT.querySelector(`[data-id="${default_el}"]`);
            if (element && !element.classList.contains("hover"))
            {
                element.classList.add("hover");
                var style_id = element.getAttribute("style-id");
                if (style_id && CURRENT_SCENE.STYLES && CURRENT_SCENE.STYLES[style_id])
                {
                    element.style.cssText = CURRENT_SCENE.STYLES[style_id].hover();
                }
            }
        }
        return;
    }
    if (input_event.type === "pointerup" || input_event.type === "pointerdown")
    {
        var current_element = CURRENT_SCENE.COMPONENT.querySelector(".hover");
        if (!current_element) { return; }
        if (!current_element.hasAttribute("action-" + input_event.type)) { return; }
        ui_scene_run_element_action(current_element);
    }
    else if (input_event.type === "pointermove")
    {
        ui_scene_clear_highlighted_elements();
        for (var e = 0; e < input_event.mouse.composed_path.length; ++e)
        {
            var element = input_event.mouse.composed_path[e];
            if (element instanceof HTMLElement && element.hasAttribute("data-id"))
            {
                element.classList.add("hover");
                var style_id = element.getAttribute("style-id");
                if (style_id && CURRENT_SCENE.STYLES && CURRENT_SCENE.STYLES[style_id])
                {
                    element.style.cssText = CURRENT_SCENE.STYLES[style_id].hover();
                }
                break;
            }
        }
    }
    else if (input_event.type === "keyup" || input_event.type === "keydown")
    {
        var current_element = CURRENT_SCENE.COMPONENT.querySelector(".hover");
        if (!current_element) { return; }
        var button = input_event.button;
        if (current_element.hasAttribute("nav-" + input_event.type))
        {
            if (button === "up")
            {
                if (current_element.hasAttribute("nav-up"))
                {
                    var next = current_element.getAttribute("nav-up");
                    ui_scene_focus_next_element(next);
                }
            }
            if (button === "left")
            {
                if (current_element.hasAttribute("nav-left"))
                {
                    var next = current_element.getAttribute("nav-left");
                    ui_scene_focus_next_element(next);
                }
            }
            if (button === "down")
            {
                if (current_element.hasAttribute("nav-down"))
                {
                    var next = current_element.getAttribute("nav-down");
                    ui_scene_focus_next_element(next);
                }
            }
            if (button === "right")
            {
                if (current_element.hasAttribute("nav-right"))
                {
                    var next = current_element.getAttribute("nav-right");
                    ui_scene_focus_next_element(next);
                }
            }
        }
        if (current_element.hasAttribute("action-" + input_event.type))
        {
            if (button === "a")
            {
                ui_scene_run_element_action(current_element);
            }
        }
    }
}

function ui_default_screen()
{
    if (CURRENT_SCENE.RENDERED === 1) { return; }
    CURRENT_SCENE.ACTIONS = {
        "TEST": function ()
        {
            console.log("TEST SCENE SCREEN FUNCTION");
        },
        "cancel": function ()
        {
            console.log("Test cancel button here");
        }
    };
    CURRENT_SCENE.STYLES = {
        "TEST": {
            hover: function () { return `border: 1px solid gold;`; },
            default: function () { return `border: 1px solid black;` },
        },
    };
    var html = `
        <div id="test_scene" class="popup topleft">
            <div class="inner_text">
                This is a test scene for default usage
            </div>
            <div>
                <div>Add appropriate content in here</div>
            </div>
            <div id="dialog_choices">
                <button
                    ${DEFAULT_INPUT_ACTIONS}
                    nav-down="cancel"
                    data-id="TEST">TEST</button>
                <button
                    class="hover"
                    ${DEFAULT_INPUT_ACTIONS}
                    nav-up="TEST"
                    data-id="cancel">Cancel</button>
            </div>
        </div>
    `;
    CURRENT_SCENE.DEFAULT_ELEMENT = "cancel";
    CURRENT_SCENE.COMPONENT.updateHTML(html);
    CURRENT_SCENE.RENDERED = 1;
}