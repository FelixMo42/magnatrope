export function isDrag() {
    return ctx.isDrag
}

const ctx = {
    isDrag: false,
    startEvent: undefined as (MouseEvent | undefined),
}

document.onpointerdown = (event) => {
    ctx.isDrag = false
    ctx.startEvent = event
}

document.onpointermove = (event) => {
    if (!ctx.startEvent) return
    const distance = ctx.startEvent.x - event.x + ctx.startEvent.y - event.y
    if (distance > 10) {
        ctx.isDrag = true
    }
}
