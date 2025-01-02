import { Hex } from "../utils/hex"

export const TREE_MAX = 100

export interface Tile {
    coord: Hex
    trees: number
}

export function Tile(coord: Hex): Tile {
    return {
        coord,
        trees: Math.floor(TREE_MAX / 2 * Math.random()) + TREE_MAX / 2,
    }
}
