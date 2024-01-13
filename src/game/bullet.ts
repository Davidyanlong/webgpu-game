import { CircleCollider } from "../circle-collider"
import { Content } from "../content"
import { Rect } from "../rect"
import { SpriteRenderer } from "../sprite-renderer"
import { Player } from "./player"


const BULLET_SPEED = 0.75

export class Bullet {
    public readonly drawRect: Rect
    #sourceRect: Rect
    #texture: Texture

    public active = true
    public collider = new CircleCollider()

    constructor() {
        const sprite = Content.sprites['laserBlue01']
        this.#texture = sprite.texture
        this.#sourceRect = sprite.sourceRect.copy()
        this.drawRect = sprite.drawRect.copy()
    }

    public spawn(player: Player) {
        this.active = true
        this.drawRect.x = player.drawRect.x + player.drawRect.width / 2
        this.drawRect.y = player.drawRect.y - player.drawRect.height
    }

    public update(dt: number) {
        this.drawRect.y -= BULLET_SPEED * dt
        this.collider.update(this.drawRect)
        if (this.drawRect.y + this.drawRect.height < 0) {
            this.active = false
        }
    }

    public draw(spriteRenderer: SpriteRenderer): void {
        spriteRenderer.drawSpriteSource(this.#texture, 
            this.drawRect, this.#sourceRect)
    }


}