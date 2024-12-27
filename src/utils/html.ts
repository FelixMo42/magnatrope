import { update } from "./use"

export function button(text: string, effect: () => void) {
    const el = m("button", text)
    el.onclick = () => update(effect)
    return el
}

export function m(tag: string, ...children: (string | HTMLElement)[]) {
    const el = document.createElement(tag)
    el.append(...children)
    return el
}
