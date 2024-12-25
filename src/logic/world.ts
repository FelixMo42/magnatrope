import { GameEvent } from "../utils/gameevents"
import { Hex, hexsInRange } from "../utils/hex"
import { Item, User } from "./item"
import { Pawn } from "./pawn"
import { Tile } from "./tile"

export interface World {
    currentUser: number,
    selectedPawn: number
    users: User[],
    tiles: Tile[],
    pawns: Pawn[],
}

function createWorld({ mapSize }: { mapSize: number }): World {
    // Generate users
    const users = [{
        name: "Player 1",
        items: [ Item("food", 3) ],
    }, {
        name: "Player 2",
        items: [ Item("food", 3) ],
    }]

    // Generate pawns
    const pawns = [
        Pawn(Hex(mapSize, -mapSize), users[0]),
        Pawn(Hex(-mapSize, mapSize), users[1]),
    ]

    // Generate tiles
    const tiles: Tile[] = hexsInRange(mapSize).map(Tile)

    // Return the new world
    return {
        currentUser: 0,
        selectedPawn: 0,
        users,
        tiles,
        pawns,
    }
}

export const WORLD: World = createWorld({ mapSize: 4 })

export const update = GameEvent((change: (s: World) => void) => {
    change(WORLD)
    return WORLD
})
