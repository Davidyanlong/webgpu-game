
import { Engine } from "./engine";
import { Player } from "./game/play";

const engine = new Engine()
engine.initalize().then(() => {
    const player = new Player(engine.inputManger,
        engine.gameBounds[0],
        engine.gameBounds[1])
    engine.onUpdate = (dt: number) => {
        player.update(dt)
    }

    engine.onDraw = () => {
        player.draw(engine.spriteRenderer)
    }
    engine.draw();
})