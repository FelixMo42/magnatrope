const context = {
    hooks: [] as Array<Function>
}

export function use<T>(data: () => T, cb: (_: T) => void, elseCb?: () => void) {
    let memory = JSON.stringify(data())
    cb(data())

    context.hooks.push(() => {
        const current = data()
        const hash = JSON.stringify(current)

        if (hash !== memory) {
            cb(current)
            memory = hash
        } else if (elseCb) {
            elseCb()
        }
    })
}

export function captureContext(cb: Function) {
    const oldContext = context.hooks
    context.hooks = []
    cb()
    const hooks = context.hooks
    context.hooks = oldContext

    return () => hooks.forEach(cb => cb())
}

export function update(change: () => void) {
    change()
    context.hooks.forEach(cb => cb())
}
