import { Container, Graphics, GraphicsContext } from "pixi.js"
import { hex2pixel, hexEqual, hexsInRange } from "../utils/hex"
import { use } from "../utils/use"
import { game } from "../logic/game"
import { Pawn } from "../logic/pawn"
import { inputManager } from "../logic/inputs"
import { isWalkable } from "../logic/tile"

const TARGET = new GraphicsContext()
        .circle(0, 0, 9)
        .fill(0x0000ff)
        .circle(0, 0, 18)
        .stroke({
            color: 0x0000ff,
            width: 7,
        })

const PAWN = new GraphicsContext()
    .circle(0, 0, 30)
    .fill(0x928E85)
    .stroke({ color: 0x222222, width: 4 })

function MoveOverlayView(pawn: Pawn) {
    const c = new Container()

    c.eventMode = "none"

    hexsInRange(pawn.actionsLeft, pawn.coord).forEach(hex => {
        const tile = game.tiles.find(t => hexEqual(t.coord, hex))
        if (tile && isWalkable(tile)) {
            const g = new Graphics(TARGET)
            
            const { x, y } = hex2pixel(tile.coord)
            g.x = x
            g.y = y

            g.alpha = 0.25

            c.addChild(g)
        }
    })

    return c
}

function SplitOverlayView(pawn: Pawn) {
    const c = new Container()

    c.eventMode = "none"

    hexsInRange(1, pawn.coord).forEach(hex => {
        const tile = game.tiles.find(t => hexEqual(t.coord, hex))
        if (tile && isWalkable(tile)) {
            const g = new Graphics(PAWN)

            const { x, y } = hex2pixel(tile.coord)
            g.x = x
            g.y = y

            g.alpha = 0.25

            c.addChild(g)
        }
    })

    return c
}


export function TileOverlayView() {
    const c = new Container()

    use(() => [inputManager.pawn, inputManager.mode] as const, ([pawn, mode]) => {
        // Clear the overlay
        while (c.children[0]) { c.removeChild(c.children[0]) }

        // If no pawn selected, then were done here
        if (!pawn) return

        // Switch based off input mode
        if (mode == "move") c.addChild(MoveOverlayView(pawn))
        if (mode == "split") c.addChild(SplitOverlayView(pawn))
    })

    return c
}