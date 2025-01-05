import { Hex } from "../utils/hex"
import { movePawn, Pawn, pawnOnTile } from "./pawn"
import { game } from "./game"
import { isDrag } from "../utils/drag"
import { update } from "../utils/use"
import { selectNextFromList } from "../utils/misc"
import { ON_START_TURN } from "./events"
import { getTile, isWalkable } from "./tile"

function selectPawn(pawn: Pawn) {
    inputManager.pawn = pawn
    inputManager.mode = "move"
}

function selectNextPawn() {
    selectPawn(selectNextFromList(
        game.pawns.filter(pawn => pawn.user === game.turn.user),
        inputManager.pawn
    )!)
}

export const inputManager = {
    mode: "move" as InputMode,
    pawn: undefined as Pawn | undefined,
    keybindings: {
        "Enter": () => game.endTurn(),
        "Tab": () => selectNextPawn(),

        "m": () => inputManager.mode = "move",
    },
    mouseEffects: {
        "move": (hex: Hex) => {
            if (pawnOnTile(hex)?.user === game.turn.user) {
                selectPawn(pawnOnTile(hex)!)
            } else if (isWalkable(getTile(hex))) {
                if (!inputManager.pawn) return
    
                // Move selected pawn
                movePawn(inputManager.pawn, hex)
    
                // Select next pawn if this one has no actions left
                // Do we want to do this?
                if (inputManager.pawn.actionsLeft === 0) selectNextPawn()
            } 
        },
        "split": (hex: Hex) => {
            if (pawnOnTile(hex)?.user === game.turn.user) {
                selectPawn(pawnOnTile(hex)!)
             } else if (
                !pawnOnTile(hex) &&
                isWalkable(getTile(hex)) &&
                inputManager.pawn!.population > 1 &&
                inputManager.pawn!.actionsLeft > 0
            ) {
                const pawn = Pawn(hex, game.turn.user)
                pawn.actionsLeft -= 1
                
                inputManager.pawn!.population -= pawn.population
                inputManager.pawn!.actionsLeft -= 1

                game.pawns.push(pawn)
            }
        }
    }
}

type InputMode = "move" | "split"

// HOOK EVENTS

ON_START_TURN.push(() => {
    selectPawn(game.pawns.find(pawn => pawn.user === game.turn.user)!)
})

// HOOK INPUTS

document.onkeyup = (event) => {
    if (event.key in inputManager.keybindings) {
        update(inputManager.keybindings[event.key])
    }
}

export function onclick(hex: Hex) {
    // Don't register click events if the user dragged
    if (isDrag()) return

    // Switch base off the current input mode
    update(() => inputManager.mouseEffects[inputManager.mode](hex))
}