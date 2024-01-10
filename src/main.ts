
import { QuadGeometry } from './geometry';
import { Texture } from './texture';
import { BufferUtil } from './buffer-util';
import { Camera } from './camera';
import { Content } from './content';
import { Rect } from './rect';
import { SpritePipeline } from './sprite-pipeline';
import { SpriteRenderer } from './sprite-renderer';
import { Color } from './color';
import { vec2 } from 'gl-matrix';

class Renderer {
  #canvas!: HTMLCanvasElement;
  #context!: GPUCanvasContext;
  #device!: GPUDevice;

  #passEncoder!: GPURenderPassEncoder;

  #spriteRenderer!: SpriteRenderer;

  #rotation = 0

  constructor() {
  }
  public async initalize() {
    this.#canvas = document.getElementById("canvasDom") as HTMLCanvasElement;
    if (this.#canvas.width != this.#canvas.clientWidth) {
      this.#canvas.width = this.#canvas.clientWidth;
      this.#canvas.height = this.#canvas.clientHeight;
    }
    this.#context = this.#canvas.getContext("webgpu") as GPUCanvasContext;
    if (!this.#context) {
      throw new Error("WebGPU not supported");
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance"
    });

    if (!adapter) {
      throw new Error("WebGPU not supported");
    }

    this.#device = await adapter.requestDevice();

    await Content.initialize(this.#device);

    const format = navigator.gpu.getPreferredCanvasFormat();

    this.#context.configure({
      device: this.#device,
      format
    })

   this.#spriteRenderer = new SpriteRenderer(this.#device, this.#canvas.width, this.#canvas.height)
   this.#spriteRenderer.initialize()
  }

  public draw() {


    const commandEncoder = this.#device.createCommandEncoder();
    const texttureView = this.#context.getCurrentTexture().createView();
    const renderPassDescription: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: texttureView,
          clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    }

    this.#passEncoder = commandEncoder.beginRenderPass(renderPassDescription);
    this.#spriteRenderer.framePass(this.#passEncoder);
    //DrAW HERE
    /*
    for (let i = 0; i < 20000; i++) {
      this.#spriteRenderer.drawSprite(Content.playerTexture, new Rect(
        this.#canvas.width * Math.random(),
        this.#canvas.height * Math.random(),
        10, 10
        ));
    }

    for (let i = 0; i < 20000; i++) {
      this.#spriteRenderer.drawSprite(Content.ufoRedTexture, new Rect(
        this.#canvas.width * Math.random(),
        this.#canvas.height * Math.random(),
        10, 10
        ));
    }
    */
    this.#rotation +=0.01
    const playerSprite = Content.sprites["playerShip1_blue.png"];

    playerSprite.drawRect.x +=0.7
    playerSprite.drawRect.y +=0.7


    const color = new Color(1, 1, 1);
    this.#spriteRenderer.drawSpriteSource(playerSprite.texture, 
      playerSprite.drawRect, 
      playerSprite.sourceRect,
      color, this.#rotation,
      vec2.fromValues(0.5, 0.5));

    const shield = Content.sprites["shield1.png"]

    shield.drawRect.x = playerSprite.drawRect.x - 13
    shield.drawRect.y = playerSprite.drawRect.y - 12

    this.#spriteRenderer.drawSpriteSource(shield.texture, 
      shield.drawRect, 
      shield.sourceRect,
      new Color(0, 0, 1), 
      this.#rotation,
      vec2.fromValues(0.5, 0.5));


    const drawRect = new Rect(100, 100, 200, 200);
    const halfHeight = Content.uvTexture.height / 2
    const halfWidth = Content.uvTexture.width / 2
    const sourceRect = new Rect(0, 0, halfWidth, halfHeight);


    this.#spriteRenderer.drawSpriteSource(Content.uvTexture, drawRect, sourceRect, undefined, 
      this.#rotation, vec2.fromValues(1, 1));

    this.#spriteRenderer.framEnd()

    // END DRAW HERE
    this.#passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);
     requestAnimationFrame(this.draw.bind(this));
  }
  

}

const renderer = new Renderer()
renderer.initalize().then(() => {
  renderer.draw();
})