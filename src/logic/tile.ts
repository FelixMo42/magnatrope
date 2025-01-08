import { Hex, hexEqual } from "../utils/hex"
import { game } from "./game"

export const TREE_MAX = 100

export type TileType = "forest" | "montain" | "water"

export interface Building {
    
}

export interface Tile {
    _type: "tile"
    coord: Hex
    trees: number
    kind: TileType
    building?: Building
}

export function Tile(coord: Hex): Tile {
    return {
        _type: "tile",
        coord,
        kind: Math.random() < 0.1 ? "montain" : "forest",
        trees: Math.floor(TREE_MAX / 2 * Math.random()) + TREE_MAX / 2,
    }
}

export function isWalkable(tile?: Tile) {
    if (!tile) return false
    return tile.kind === "forest"
}

export function getTile(hex: Hex) {
    return game.tiles.find(tile => hexEqual(tile.coord, hex))!
}
