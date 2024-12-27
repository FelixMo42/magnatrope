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
        SelectedArticle(),
        ResourcesArticle(),
        GameActionsArticle(),
    )
}

function GameActionsArticle() {
    return m("article",
        m("label", "Game Actions"),
        button("End Turn", () => game.endTurn())
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
            m("label", `Selected: Pawn`),
            m("p", `Actions: ${pawn.actionsLeft}/${pawn.actionsFull}`),
            m("p", `Population: ${pawn.population}`),
            
            pawn.statuses.length === 0 ? "" :
                m("p", `Statues: ${pawn.statuses.join(", ")}`),
            
            ...getPawnActions(pawn).map(action =>
                button(
                    `${action.name} ${displayItems(action)}`,
                    () => pawnDoAction(pawn, action)
                )
            ),
        ]
    })
}

function ResourcesArticle() {
    return dyn(() => game.turn.user, (user) => [
        m("label", "Resources"),
        ...user.items.map(item =>
            m("p", `${capitalize(item.name)}: ${item.amount}`)
        )
    ])
}

function displayItems(o: { items: Item[] }) {
    if (o.items.length === 0) return ""
    return `(${o.items.map(i =>
        i.amount < 0 ? `-${-i.amount} ${i.name}` :
            `+${i.amount} ${i.name}`
    ).join(", ")})`
}

type Child = HTMLElement | string
function dyn<T>(data: () => T, build: (a: T, el: HTMLElement) => Child[]) {
    const el = m("article")
    use(data, (a: T) => el.replaceChildren(...build(a, el)))
    return el
}