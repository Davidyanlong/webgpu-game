import { vec2 } from "gl-matrix";
import { Content } from "../content";
import { SpriteRenderer } from "../sprite-renderer";

export class HeightScore {
    readonly #position = vec2.fromValues(10, 10);
    public currentScore: number = 0;

    public draw(spriteRenderer: SpriteRenderer) {
        spriteRenderer.drawString(
            Content.spriteFont,
            `Score: ${this.currentScore}`,
            this.#position,
            undefined,
            0.5
        );
    }
}