import App from './app'
import { game } from './logic/game'
import { captureContext, use } from './utils/use'
import { EndScreen } from './views/screens/EndScreen'
import { GameScreen } from './views/screens/GameScreen'
import { StartScreen } from './views/screens/StartSceen'

async function main() {
    // Init Pixi.js app
    const app = await App.createAndInit("black")

    game.start()
    
    // Screens
    const screens = {
        StartScreen,
        GameScreen,
        EndScreen,
    }

    tabView(app, screens, () => {
        if (game.isDone) return "EndScreen"
        if (game.isStarted) return "GameScreen"
        return "StartScreen"
    })
}

function tabView
    <Screens extends { [k: string]: (app: App) => void }>
    (app: App, screens: Screens, selection: () => keyof Screens) {
        let memory = selection()
        let context = captureContext(() => screens[memory](app))

        use(() => selection(), (newScreen) => {
            // If not the same, then move to new screen
            if (newScreen !== memory) {
                memory = newScreen

                // Remove all sprites
                app.viewport.removeChildren()

                // Render new screen
                context = captureContext(() => screens[newScreen](app))
            }
        }, () => context())
    }

// Make sure everthing is done importing before main is called
// This is mostly important to make sure all cbs have been hooked
setTimeout(main, 0)