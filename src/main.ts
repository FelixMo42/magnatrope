import App from './app'
import { Item } from './logic/item'
import { getPawnActions, Pawn, pawnDoAction } from './logic/pawn'
import { game } from './logic/game'
import { capitalize } from './utils/misc'
import { update, use } from './utils/use'
import { GameView } from './views/GameView'
import { inputManager } from './logic/inputs'

async function main() {
    // Event stuff
    game.start()

    // Pixi.js stuff
    const app = await App.createAndInit("black")
    app.viewport.addChild(GameView())

    // HTML stuff
    SelectedHtml()
    ResourcesHtml()

    document
        .getElementById("endturn")!
        .onclick = () => update(() => game.endTurn())
}

function ResourcesHtml() {
    const el = document.getElementById("items")!
    use(() => game.turn.user, (user) => {
        el.replaceChildren(
            m("label", "Resources"),
            ...user.items.map(item =>
                m("p", `${capitalize(item.name)}: ${item.amount}`)
            )
        )
    })
}

function SelectedHtml() {
    const el = document.getElementById("selected")!
    use(() => inputManager.pawn, (pawn) => {
        if (!pawn) {
            el.style.display = "none";
            return
        } else {
            el.style.display = "";
        }

        el.replaceChildren(
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
        )
    })
}

function displayItems(o: { items: Item[] }) {
    if (o.items.length === 0) return ""
    return `(${o.items.map(i =>
        i.amount < 0 ? `-${-i.amount} ${i.name}` :
            `+${i.amount} ${i.name}`
    ).join(", ")})`
}

function button(text: string, effect: () => void) {
    const el = m("button", text)
    el.onclick = () => update(effect)
    return el
}

function m(tag: string, ...children: (string | HTMLElement)[]) {
    const el = document.createElement(tag)
    el.append(...children)
    return el
}

setTimeout(main, 0)