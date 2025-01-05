import App from '../../app'
import { Item } from '../../logic/item'
import { getPawnActions, pawnDoAction } from '../../logic/pawn'
import { game } from '../../logic/game'
import { capitalize } from '../../utils/misc'
import { use } from '../../utils/use'
import { GameView } from '../GameView'
import { inputManager } from '../../logic/inputs'
import { button, m } from '../../utils/html'

export async function GameScreen(app: App) {
    // Pixi.js stuff
    app.viewport.addChild(GameView())

    // HTML stuff
    document.getElementById("ui")!.replaceChildren(
        m("article",
            SelectedArticle(),
            ResourcesArticle(),
            GameActionsArticle(),
        )
    )
}

function GameActionsArticle() {
    return m("div",
        button("DONE", () => game.endTurn())
    )
}

function SelectedArticle() {
    return dyn(() => inputManager.pawn, (pawn, el) => {
        if (!pawn) {
            el.style.display = "none"
            return []
        } else {
            el.style.display = ""
        }

        return [
            ...getPawnActions(pawn).map(action =>
                button(
                    `${action.name}`,
                    () => pawnDoAction(pawn, action)
                )
            ),
        ]
    })
}

function ResourcesArticle() {
    return dyn(() => game.turn.user, (user) => [
        ...user.items.map(item =>
            m("p", `${item.amount} 🍏 +0`)
        )
    ])
}

type Child = HTMLElement | string
function dyn<T>(data: () => T, build: (a: T, el: HTMLElement) => Child[]) {
    const el = m("div")
    use(data, (a: T) => el.replaceChildren(...build(a, el)))
    return el
}