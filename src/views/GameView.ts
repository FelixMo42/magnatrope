import { Container } from "pixi.js"
import { game } from "../logic/game"
import { captureContext, use } from "../utils/use"
import { TileView } from "./TileView"
import { PawnView } from "./PawnView"
import { TileOverlayView } from "./TileOverlayView"

export function GameView() {
    const c = new Container()

    c.addChild(WorldArrayView(() => game.tiles, TileView))
    c.addChild(TileOverlayView())
    c.addChild(WorldArrayView(() => game.pawns, PawnView))

    return c
}

function WorldArrayView<T>(data: () => T[], draw: (t: T) => Container) {
    const container = new Container()
    const itemviews = new Map<T, Container>()
    const callbacks = new Map<T, Function>()

    use(data, array => {
        // Remove old sprites
        for (const [t, sprite] of itemviews) {
            if (!array.includes(t)) {
                sprite.destroy()

                itemviews.delete(t)
                callbacks.delete(t)
            }
        }

        // Add new sprites & call updates for existing ones
        for (const t of array) {
            if (!itemviews.has(t)) {
                callbacks.set(t, captureContext(() => {
                    itemviews.set(t, draw(t))
                    container.addChild(itemviews.get(t)!)
                }))
            } else {
                callbacks.get(t)!()
            }
        }
    }, () => {
        callbacks.forEach((cb) => cb())
    })

    return container
}
