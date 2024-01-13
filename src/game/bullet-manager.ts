import { SpriteRenderer } from "../sprite-renderer"
import { Bullet } from "./bullet"
import { Enemy } from "./enemy"
import { Player } from "./player"

const SPAWN_TIME = 250

export class BulletManger {
    #pool: Bullet[] = []
    #timeToSpawn = 0
    constructor(private readonly player: Player) { }

    public create() {
        let bullet = this.#pool.find((b) => !b.active)
        if (!bullet) {
            bullet = new Bullet()
            this.#pool.push(bullet)
        }
        bullet.spawn(this.player)
    }

    public intersectsEnemy(enemy: Enemy) {
        for (const bullet of this.#pool) {
            if (bullet.active && bullet.collider.intersects(enemy.collider)) {
                bullet.active = false
                return true
            }
        }
        return false
    }

    public update(dt: number) {
        this.#timeToSpawn += dt
        if (this.#timeToSpawn > SPAWN_TIME) {

            this.#timeToSpawn = 0
            this.create()

        }
        for (const bullet of this.#pool) {
            if (bullet.active) {
                bullet.update(dt)
            }
        }
    }

    public draw(spriteRenderer: SpriteRenderer) {
        for (const bullet of this.#pool) {
            if (bullet.active) {
                bullet.draw(spriteRenderer)
            }
        }
    }
}