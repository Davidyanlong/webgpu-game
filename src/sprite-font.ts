import { vec2 } from "gl-matrix";
import { Quad } from "./quad";
import { Texture } from "./texture";

export class SpriteFontChar {
    constructor(
        public textureCoords: Quad,
        public size: vec2,
        public advance: number,
        public offset: vec2) {

    }
}

export class SpriteFont {
    private chars: { [id: number]: SpriteFontChar } = {};
    constructor(public readonly texture: Texture,
        public readonly lineHeight: number) {

    }
    public getChar(charCode: number): SpriteFontChar {
        return this.chars[charCode];
    }
    public createChar(unicode: number,
        textureCoords: Quad,
        size: vec2,
        advance: number,
        offset: vec2): SpriteFontChar {
        const char = new SpriteFontChar(textureCoords, size, advance, offset);
        this.chars[unicode] = char;
        return char;
    }
}