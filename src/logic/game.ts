import { Hex, hexsInRange } from "../utils/hex"
import { selectNextFromList } from "../utils/misc"
import { ON_START_TURN } from "./events"
import { getItemAmount, Item, updateUserItem } from "./item"
import { givePawnStatus, killPawn, Pawn, pawnHasStatus } from "./pawn"
import { Tile } from "./tile"
import { ColonistController, InputController, User } from "./user"

interface GameOptions {
    mapSize: number
}

class Game {
    isStarted = false
    isDone = false
    
    users: User[] = []
    tiles: Tile[] = []
    pawns: Pawn[] = []

    turn: {
        user: User
    }

    start() {
        this.isStarted = true
        ON_START_TURN.forEach(cb => cb())
    }

    endTurn() {
        // Is the game over?
        if (gameOver()) return this.isDone = true

        // Who's turn is starting?
        game.turn.user = selectNextFromList(game.users, game.turn.user)
        game.turn.user.controller.onTurnStart()

        // Inform the world
        ON_START_TURN.forEach(cb => cb())
    }

    constructor({ mapSize }: GameOptions) {
        this.users = [{
            name: "Player",
            items: [ Item("food", 3) ],
            controller: InputController,
        }, {
            name: "Colonist",
            items: [ Item("food", 3) ],
            controller: ColonistController,
        }]

        this.pawns = [
            Pawn(Hex(0, 0), this.users[0], { population: 3 }),
            Pawn(Hex(-mapSize, mapSize), this.users[1], { population: 3 }),
        ]

        this.tiles = hexsInRange(mapSize).map(Tile)

        this.turn = {
            user: this.users[0]
        }
    }
}

function gameOver() {
    const usersLeft = new Set()
    for (const pawn of game.pawns) usersLeft.add(pawn.user)
    return usersLeft.size <= 1
}

export const game = new Game({
    mapSize: 4
})
