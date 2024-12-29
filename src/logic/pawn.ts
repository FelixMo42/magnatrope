import { Hex, hexEqual } from "../utils/hex"
import { pathfind } from "../utils/pathfinding"
import { getItemAmount, Item, updateUserItem, User } from "./item"
import { game } from "./game"
import { inputManager } from "./inputs"

export interface Pawn {
    coord: Hex,
    user: User,
    population: number,
    statuses: PawnStatus[],
    actionsLeft: number,
    actionsFull: number,
}

export type PawnStatus = "starving"

export function Pawn(coord: Hex, user: User, prototype: Partial<Pawn>={}): Pawn {
    return {
        population: 1,
        statuses: [],
        actionsLeft: 2,
        actionsFull: 2,
        ...prototype,
        coord,
        user,
    }
}

export function movePawn(pawn: Pawn, hex: Hex) {
    const path = pathfind(pawn.coord, hex)

    while (hasActionsLeft(pawn) && path.length > 0) {
        const hex = path.shift()!
        pawn.actionsLeft -= 1

        if (pawnOnTile(hex)) {
            return attackPawn(pawn, pawnOnTile(hex)!)
        } else {
            pawn.coord = hex
        }

    }

    function attackPawn(attacker: Pawn, defender: Pawn) {
        defender.population -= Math.ceil(attacker.population / 2)
        if (defender.population <= 0) killPawn(defender)
    }
}

export function pawnOnTile(hex: Hex) {
    return game.pawns.find((pawn) => hexEqual(pawn.coord, hex))
}

export function hasActionsLeft(pawn: Pawn) {
    return pawn.actionsLeft > 0
}

export function killPawn(pawn: Pawn) {
    game.pawns = game.pawns.filter((p) => p !== pawn)
}

// Actions

export interface PawnAction {
    name: string,
    actionCost: number,
    items: Item[],
    effect: (pawn: Pawn) => void,
}

function pawnCanDoAction(pawn: Pawn, action: PawnAction) {
    // Make sure we have enough actions
    if (pawn.actionsLeft < action.actionCost) {
        return false
    }

    // Make sure we have enough items
    for (const item of action.items) {
        const user = game.turn.user
        if (getItemAmount(user, item.name) < -item.amount) {
            return false
        }
    }

    return true
}

export function pawnDoAction(pawn: Pawn, action: PawnAction) {
    if (pawnCanDoAction(pawn, action)) {
        // Use actions
        pawn.actionsLeft -= action.actionCost
        
        // Give/use items
        if (action.items) {
            action.items.forEach((item) => {
                updateUserItem(game.turn.user, item)
            })
        }

        // Apply effect
        action.effect(pawn)
    }
}

export function Action(
    name: string,
    items: Item[],
    effect: (pawn: Pawn) => void = () => {},
    actionCost: number = 1,
): PawnAction {
    return { name,  items, actionCost, effect }
}

export function getPawnActions(pawn: Pawn): PawnAction[] {
    return [
        Action("Forage", [Item("food", pawn.population)]),
        Action("Split Population", [], () => inputManager.mode = "split", 0),
        Action("Increase Population", [], () => pawn.population += 1),
    ]
}

// Statues

export function pawnHasStatus(pawn: Pawn, status: PawnStatus) {
    return pawn.statuses.includes(status)
}

export function givePawnStatus(pawn: Pawn, status: PawnStatus) {
    if (!pawnHasStatus(pawn, status)) {
        pawn.statuses.push(status)
    }
}

export function removePawnStatus(pawn: Pawn, status: PawnStatus) {
    pawn.statuses = pawn.statuses.filter((s) => s !== status)
}
