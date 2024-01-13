import { Explosion } from "./explosion";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";

export class ExplosionManager {
    #pool: Explosion[] = []
    public create(drawRect: Rect) {
        let explosion = this.#pool.find(e => !e.playing)
        // if not found, create
        if (!explosion) {
            explosion = new Explosion()
            this.#pool.push(explosion)
        }

        explosion.play(drawRect)
    }

    public update(dt: number) {
        for (const explosion of this.#pool) {
            if (explosion.playing) {
                explosion.update(dt)
            }
        }
    }
    public draw(spriteRenderer: SpriteRenderer) {
        for (const explosion of this.#pool) {
            if (explosion.playing) {
                explosion.draw(spriteRenderer)
            }
        }
    }
}