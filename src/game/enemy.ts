import { CircleCollider } from "../circle-collider";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";

export interface Enemy{
    active: boolean;
    drawRect: Rect;
    readonly  collider: CircleCollider

    update(dt: number): void;
    draw(spriteRenderer: SpriteRenderer): void;
}