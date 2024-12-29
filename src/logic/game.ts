import { Hex, hexsInRange } from "../utils/hex"
import { selectNextFromList } from "../utils/misc"
import { ON_START_TURN } from "./events"
import { getItemAmount, Item, updateUserItem, User } from "./item"
import { givePawnStatus, killPawn, Pawn, pawnHasStatus } from "./pawn"
import { Tile } from "./tile"

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

        // Use food for all their pawns
        game.pawns
            .filter((pawn) => pawn.user === game.turn.user)
            .forEach((pawn) => {
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

        // Inform the world
        ON_START_TURN.forEach(cb => cb())
    }

    constructor({ mapSize }: GameOptions) {
        this.users = [{
            name: "Player 1",
            items: [ Item("food", 3) ],
        }, {
            name: "Player 2",
            items: [ Item("food", 3) ],
        }]

        this.pawns = [
            Pawn(Hex(mapSize, -mapSize), this.users[0], { population: 3 }),
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
