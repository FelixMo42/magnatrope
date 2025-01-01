import { hexDistance } from "../utils/hex"
import { game } from "./game"
import { getItemAmount, Item, updateUserItem } from "./item"
import { givePawnStatus, killPawn, movePawn, Pawn, pawnHasStatus } from "./pawn"

export interface User {
    name: string
    items: Item[]
    controller: Controller
}

export interface Controller {
    onTurnStart(): void
}

export const InputController: Controller = {
    onTurnStart() {
        // Use food for all their pawns
        getTurnPawns().forEach((pawn) => {
            const food = Item("food", -pawn.population)

            if (getItemAmount(game.turn.user, "food") >= food.amount) {
                updateUserItem(game.turn.user, food)
                pawn.actionsLeft = pawn.actionsFull
            } else if (!pawnHasStatus(pawn, "starving")) {
                givePawnStatus(pawn, "starving")
                pawn.actionsLeft = pawn.actionsFull - 1
            } else {
                killPawn(pawn)
            }
        })
    }
}

export const ColonistController: Controller = {
    onTurnStart() {
        // Move to start attacking
        getTurnPawns().forEach((pawn) => {
            pawn.actionsLeft = pawn.actionsFull
            movePawn(pawn, getClosestEnemeyPawn(pawn).coord)
        })

        // End the turn
        game.endTurn()
    }
}

// UTILS

function getClosestEnemeyPawn({ coord }: Pawn): Pawn {
    return game.pawns
        .filter((pawn) => pawn.user !== game.turn.user)
        .sort((pawn) => hexDistance(pawn.coord, coord))
        [0]
}

function getTurnPawns() {
    return game.pawns.filter((pawn) => pawn.user === game.turn.user)
}