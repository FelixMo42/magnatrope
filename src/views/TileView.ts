import { Graphics } from "pixi.js"
import { hex2pixel, HEX_SIZE } from "../utils/hex"
import { Tile } from "../logic/tile"
import { onclick } from "../logic/inputs"
import { use } from "../utils/use"

export function TileView(tile: Tile) {
    // Draw a hex with the right color
    const g = new Graphics()
    use(() => tile.trees, () => {
        g   .clear()
            .regularPoly(0, 0, HEX_SIZE, 6, 0)
            .fill((140 - tile.trees) << 8)
    })

    // Repoistion the graphic to be in the right spot
    const { x, y } = hex2pixel(tile.coord)
    g.x = x
    g.y = y

    // What happens when we click on the tile?
    g.interactive = true
    g.onpointertap = () => onclick(tile.coord)

    return g
}
