import { game } from "../../logic/game"
import { button } from "../../utils/html"

export async function StartScreen() {
    document
        .getElementById("ui")!
        .appendChild(button("Start", () => game.start()))
}