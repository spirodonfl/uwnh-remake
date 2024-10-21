// fsm.odin
package common

import "core:fmt"

MAX_STATES :: 32
MAX_TRANSITIONS :: 64

FSM :: struct($State: typeid, $Transition: typeid) {
    states: [MAX_STATES]struct {
        state: State,
        on_enter: proc(),
        on_exit: proc(),
    },
    transitions: [MAX_TRANSITIONS]struct {
        transition: Transition,
        from: State,
        to: State,
        on_transition: proc(),
    },
    state_count: int,
    transition_count: int,
    current_state: State,
}

create_fsm :: proc($State: typeid, $Transition: typeid) -> FSM(State, Transition) {
    fsm: FSM(State, Transition)
    fsm.state_count = 0
    fsm.transition_count = 0
    return fsm
}

add_state :: proc(fsm: ^FSM($State, $Transition), state: State, on_enter: proc() = nil, on_exit: proc() = nil) {
    if fsm.state_count < MAX_STATES {
        fsm.states[fsm.state_count] = {state = state, on_enter = on_enter, on_exit = on_exit}
        fsm.state_count += 1
    } else {
        fmt.eprintln("Error: Maximum number of states reached")
    }
}

add_transition :: proc(fsm: ^FSM($State, $Transition), transition: Transition, from: State, to: State, on_transition: proc() = nil) {
    if fsm.transition_count < MAX_TRANSITIONS {
        fsm.transitions[fsm.transition_count] = {transition = transition, from = from, to = to, on_transition = on_transition}
        fsm.transition_count += 1
    } else {
        fmt.eprintln("Error: Maximum number of transitions reached")
    }
}

set_initial_state :: proc(fsm: ^FSM($State, $Transition), state: State) {
    fsm.current_state = state
    for i in 0..<fsm.state_count {
        if fsm.states[i].state == state && fsm.states[i].on_enter != nil {
            fsm.states[i].on_enter()
            break
        }
    }
}

transition :: proc(fsm: ^FSM($State, $Transition), transition: Transition) -> bool {
    for i in 0..<fsm.transition_count {
        t := fsm.transitions[i]
        if t.transition == transition && t.from == fsm.current_state {
            for j in 0..<fsm.state_count {
                if fsm.states[j].state == fsm.current_state && fsm.states[j].on_exit != nil {
                    fsm.states[j].on_exit()
                    break
                }
            }

            if t.on_transition != nil {
                t.on_transition()
            }

            fsm.current_state = t.to

            for j in 0..<fsm.state_count {
                if fsm.states[j].state == t.to && fsm.states[j].on_enter != nil {
                    fsm.states[j].on_enter()
                    break
                }
            }

            return true
        }
    }
    return false
}

get_current_state :: proc(fsm: ^FSM($State, $Transition)) -> State {
    return fsm.current_state
}