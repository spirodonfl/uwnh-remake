package game

import "../common"

@(export)
renderer_should_redraw :: proc() -> bool {
    return common.renderer_should_redraw()
}