
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

    const postProcessEffect = await engine.effectsFactory.createBlurEffect();

    postProcessEffect.doHorizontalPass = true;
    postProcessEffect.doVerticalPass = true;

    document.getElementById("horizontal")?.addEventListener('click', (e) => {
        postProcessEffect.doHorizontalPass = !postProcessEffect.doHorizontalPass;
        (e.target as HTMLInputElement).checked = postProcessEffect.doHorizontalPass
    })

    document.getElementById("vertical")?.addEventListener('click', (e) => {
        postProcessEffect.doVerticalPass = !postProcessEffect.doVerticalPass;
        (e.target as HTMLInputElement).checked = postProcessEffect.doVerticalPass
    })


    engine.onUpdate = (dt: number) => {
        player.update(dt)
        background.update(dt)
        enemyManager.update(dt)
        explosionManager.update(dt)
        bulletManger.update(dt)
    }

    engine.onDraw = () => {
        const renderTexture = postProcessEffect.getRenderTexture();
        if (renderTexture) {
            engine.setDestinationTexture(renderTexture.texture);
        } else {
            engine.setDestinationTexture(null)
        }
        background.draw(engine.spriteRenderer)
        player.draw(engine.spriteRenderer)
        enemyManager.draw(engine.spriteRenderer)
        bulletManger.draw(engine.spriteRenderer)
        explosionManager.draw(engine.spriteRenderer)
        hightScore.draw(engine.spriteRenderer)

        if (renderTexture) {
            postProcessEffect.draw(engine.getCanvasTexture().createView())
        }
    }
    engine.draw();
})