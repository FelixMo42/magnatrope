import { Hex } from "../utils/hex"
import { getItemAmount, Item, updateUserItem } from "./item"
import { givePawnStatus, killPawn, movePawn, Pawn, pawnHasStatus, pawnOnTile } from "./pawn"
import { update, World } from "./world"

document.onkeyup = (event) => {
    if (event.key === "E") {
        endturn()
    }

    if (event.key === "Tab") {
        update(w => selectNextPawn(w))
    }

    if (event.key === "f") {
        
    }
}

const captures = new Map<string, Function>()

// Drag detection
let isDrag = false
let pressStartEvent: MouseEvent | undefined;
document.onpointerdown = (event) => {
    isDrag = false
    pressStartEvent = event
}
document.onpointermove = (event) => {
    if (!pressStartEvent) return
    const distance = pressStartEvent.x - event.x + pressStartEvent.y - event.y
    if (distance > 10) {
        isDrag = true
    }
}

export function getTurnUser(world: World) {
    return world.users[world.currentUser]
}

function getPawnIndex(world: World, pawn: Pawn) {
    return world.pawns.findIndex((p) => p === pawn)
}

export function getSelectedPawn(world: World) {
    return world.pawns[world.selectedPawn]
}

function selectNextPawn(world: World) {
    world.selectedPawn = (world.selectedPawn + 1) % world.pawns.length

    if (getSelectedPawn(world).user !== getTurnUser(world)) {
        selectNextPawn(world)
    }
}

export function onclick(hex: Hex) {
    if (isDrag) return

    update((w) => {
        if (captures.has("onclick")) {
            return captures.get("onclick")!(w, hex)
        }

        if (pawnOnTile(w, hex)?.user === getTurnUser(w)) {
            w.selectedPawn = getPawnIndex(w, pawnOnTile(w, hex)!)
        } else if (!pawnOnTile(w, hex)) {
            const pawn = getSelectedPawn(w)
            if (!pawn) return

            // Move selected pawn
            movePawn(pawn, hex)

            // Select next pawn if this one has no actions left
            // Do we want to do this?
            if (pawn.actionsLeft === 0) selectNextPawn(w)
        }
    })
}

export function capture(event: string, callback: Function) {
    captures.set(event, (...params: any[]) => {
        callback(...params)
        captures.delete(event)
    })
}

// End Turn

export function endturn() {
    update((world) => {
        // Who's turn is starting?
        world.currentUser = (world.currentUser + 1) % world.users.length
        const user = getTurnUser(world)

        // Use food for all their pawns
        world.pawns
            .filter((pawn) => pawn.user === user)
            .forEach((pawn) => {
                if (getItemAmount(user, "food") >= pawn.population) {
                    updateUserItem(user, Item("food", -pawn.population))
                    pawn.actionsLeft = pawn.actionsFull
                } else if (!pawnHasStatus(pawn, "starving")) {
                    givePawnStatus(pawn, "starving")
                    pawn.actionsLeft = pawn.actionsFull - 1
                } else {
                    killPawn(pawn)
                }
            })

        // Reset the selected pawn
        world.selectedPawn = -1
        selectNextPawn(world)
    })
}
