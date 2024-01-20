
import { Content } from './content';
import { SpriteRenderer } from './sprite-renderer';
import { InputManger } from './input-manager';
import { vec2 } from 'gl-matrix';
import { EffectFactory } from './effects-factory';

export class Engine {
  #canvas!: HTMLCanvasElement;
  #context!: GPUCanvasContext;
  #device!: GPUDevice;
  #lastTime: number = 0
  #passEncoder!: GPURenderPassEncoder;
  // if this is null, we are rendering to the screen
  #destinationTexture: GPUTexture | null = null;

  public spriteRenderer!: SpriteRenderer;
  public inputManger!: InputManger;
  public effectsFactory!: EffectFactory;
  public gameBounds = vec2.create()

  public onUpdate = (deltaTime: number) => { }
  public onDraw = () => { }

  public setDestinationTexture(texture: GPUTexture | null) {
    this.#destinationTexture = texture;
  }
  public getCanvasTexture():GPUTexture {
    return this.#context.getCurrentTexture()
  }
  public async initalize() {
    this.#canvas = document.getElementById("canvasDom") as HTMLCanvasElement;
    if (this.#canvas.width != this.#canvas.clientWidth) {
      this.#canvas.width = this.#canvas.clientWidth;
      this.#canvas.height = this.#canvas.clientHeight;
    }
    this.gameBounds[0] = this.#canvas.width
    this.gameBounds[1] = this.#canvas.height

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

    this.spriteRenderer = new SpriteRenderer(this.#device, this.#canvas.width, this.#canvas.height)
    this.spriteRenderer.initialize()

    this.inputManger = new InputManger()
    this.effectsFactory = new EffectFactory(this.#device, this.#canvas.width, this.#canvas.height);
  }

  public draw() {
    const now = performance.now();
    const deltaTime = now - this.#lastTime
    this.#lastTime = now;
    this.onUpdate(deltaTime)
    const commandEncoder = this.#device.createCommandEncoder();
    const textureView = this.#destinationTexture != null ?
      this.#destinationTexture.createView() :
      this.#context.getCurrentTexture().createView();
    const renderPassDescription: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
          view: textureView
        }
      ]
    }

    this.#passEncoder = commandEncoder.beginRenderPass(renderPassDescription);
    this.spriteRenderer.framePass(this.#passEncoder);

    this.onDraw();

    this.spriteRenderer.framEnd()

    // END DRAW HERE
    this.#passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(this.draw.bind(this));
  }


}
