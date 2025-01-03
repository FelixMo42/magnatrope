import { Hex, hexEqual } from "../utils/hex"
import { game } from "./game"

export const TREE_MAX = 100

export type TileType = "forest" | "montain" | "water"

export interface Tile {
    coord: Hex
    trees: number
    type: TileType
}

export function Tile(coord: Hex): Tile {
    return {
        coord,
        type: Math.random() < 0.1 ? "montain" : "forest",
        trees: Math.floor(TREE_MAX / 2 * Math.random()) + TREE_MAX / 2,
    }
}

export function isWalkable(tile: Tile) {
    return tile.type === "forest"
}

export function getTile(hex: Hex) {
    return game.tiles.find(tile => hexEqual(tile.coord, hex))!
}
