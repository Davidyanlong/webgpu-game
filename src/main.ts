
import { vec2 } from "gl-matrix";
import { Content } from "./content";
import { Engine } from "./engine";
import { Background } from "./game/background";
import { BulletManger } from "./game/bullet-manager";
import { EnemyManager } from "./game/enemy-manager";
import { ExplosionManager } from "./game/explosion-manager";
import { Player } from "./game/player";
import { Color } from "./color";
import { HeightScore } from "./game/high-score";

const engine = new Engine()
engine.initalize().then(async () => {
    const player = new Player(engine.inputManger,
        engine.gameBounds[0],
        engine.gameBounds[1])

    const background = new Background(engine.gameBounds[0], engine.gameBounds[1])
    const explosionManager = new ExplosionManager()
    const bulletManger = new BulletManger(player)
    const hightScore = new HeightScore()
    const enemyManager = new EnemyManager(player,
        explosionManager,
        bulletManger,
        engine.gameBounds[0],
        engine.gameBounds[1],
        hightScore);

    const postProcessEffect = await engine.effectsFactory.createPostProcessEffect();


    engine.onUpdate = (dt: number) => {
        player.update(dt)
        background.update(dt)
        enemyManager.update(dt)
        explosionManager.update(dt)
        bulletManger.update(dt)
    }

    engine.onDraw = () => {
        engine.setDestinationTexture(postProcessEffect.texture.texture);
        background.draw(engine.spriteRenderer)
        player.draw(engine.spriteRenderer)
        enemyManager.draw(engine.spriteRenderer)
        bulletManger.draw(engine.spriteRenderer)
        explosionManager.draw(engine.spriteRenderer)
        hightScore.draw(engine.spriteRenderer)

        postProcessEffect.draw(engine.getCanvasTexture().createView())
    }
    engine.draw();
})