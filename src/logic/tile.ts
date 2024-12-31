import { Hex } from "../utils/hex"

export interface Tile {
    coord: Hex
    trees: number
}

export function Tile(coord: Hex): Tile {
    return {
        coord,
        trees: Math.floor(50 * Math.random()) + 50,
    }
}
