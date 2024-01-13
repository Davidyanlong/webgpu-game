import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";

const TIME_TO_NEXT_FRAME = 1000 / 30;

export class Explosion {
    public playing = false;
    #timeTONextFrame = 0
    #sourceRect: Rect;
    #drawRect: Rect;

    #currentCol = 0
    #currentRow = 0

    readonly cols = 4
    readonly rows = 4

    constructor() {
        this.#sourceRect = new Rect(0, 0, 400,400);
        this.#drawRect = new Rect(0, 0, 400, 400);
    }

    public play(drawRect: Rect): void {
        this.playing = true;
        this.#timeTONextFrame = 0
        this.#currentCol = 0
        this.#currentRow = 0

        this.#drawRect = drawRect.copy()

    }

    public update(dt: number): void {
        if (this.playing) {
            this.#timeTONextFrame += dt
            if (this.#timeTONextFrame > TIME_TO_NEXT_FRAME) {
                this.#timeTONextFrame = 0
                this.#currentCol++
                if (this.#currentCol >= this.cols) {
                    this.#currentCol = 0
                    this.#currentRow++
                    if (this.#currentRow >= this.rows) {
                        this.#currentRow = 0
                        this.playing = false
                    }
                }
            }

        }
    }
    public draw(spriteRenderer: SpriteRenderer): void {
        this.#sourceRect.x = this.#currentCol * this.#sourceRect.width
        this.#sourceRect.y = this.#currentRow * this.#sourceRect.height

        spriteRenderer.drawSpriteSource(Content.explosionTexture,
             this.#drawRect,
              this.#sourceRect)
    }
}