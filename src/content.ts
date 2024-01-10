import { Rect } from "./rect";
import { Sprite } from "./sprite";
import { Texture } from "./texture";

export class Content {
    public static playerTexture: Texture;
    public static ufoRedTexture: Texture
    public static uvTexture: Texture;
    public static spriteSheet:Texture

    public static sprites: { [id: string]: Sprite } = {}

    public static async initialize(device: GPUDevice) {
        this.playerTexture = await Texture.createTextureFromURL(device, "assets/PNG/playerShip1_blue.png");
        this.ufoRedTexture = await Texture.createTextureFromURL(device, "assets/PNG/ufoRed.png");
        this.uvTexture = await Texture.createTextureFromURL(device, "assets/awesomeface.png");
        this.spriteSheet = await Texture.createTextureFromURL(device, "assets/Spritesheet/sheet.png");
        await this.loadSpriteSheet()
    }

    private static async loadSpriteSheet() {
        const sheetXmlReq = await fetch("/assets/Spritesheet/sheet.xml");
        const sheetXMLText = await sheetXmlReq.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sheetXMLText, "text/xml");
        xmlDoc.querySelectorAll("SubTexture").forEach((subTexture) => {
            const name = subTexture.getAttribute("name")!;
            const x = parseInt(subTexture.getAttribute("x")!);
            const y = parseInt(subTexture.getAttribute("y")!);
            const width = parseInt(subTexture.getAttribute("width")!);
            const height = parseInt(subTexture.getAttribute("height")!);

            const drawRect = new Rect(0, 0, width, height);
            const sourceRect = new Rect(x, y, width-1, height-1);

            this.sprites[name] = new Sprite(this.spriteSheet, drawRect, sourceRect)
        })

    }
}