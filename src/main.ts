
import { QuadGeometry } from './geometry';
import { Texture } from './texture';
import { BufferUtil } from './buffer-util';
import { Camera } from './camera';
import { Content } from './content';
import { Rect } from './rect';
import { SpritePipeline } from './sprite-pipeline';

class Renderer {
  #canvas!: HTMLCanvasElement;
  #context!: GPUCanvasContext;
  #device!: GPUDevice;

  #passEncoder!: GPURenderPassEncoder;

  #IndicesBuffer!: GPUBuffer;
  #projectviewMatrixBuffer!: GPUBuffer;

  #vertexData: Float32Array = new Float32Array(7 * 4);
  #camera!: Camera;


  constructor() {
  }
  public async initalize() {
    this.#canvas = document.getElementById("canvasDom") as HTMLCanvasElement;

    if (this.#canvas.width != this.#canvas.clientWidth) {
      this.#canvas.width = this.#canvas.clientWidth;
      this.#canvas.height = this.#canvas.clientHeight;
    }

    this.#camera = new Camera(this.#canvas.width, this.#canvas.height);

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

    this.#projectviewMatrixBuffer = BufferUtil.createUniformBuffer(this.#device, new Float32Array(16));
    // this.#vertexBuffer = BufferUtil.createVertexBuffer(this.#device, this.#vertexData);
    this.#IndicesBuffer = BufferUtil.createIndexBuffer(this.#device, new Uint16Array([
      0, 1, 2,
      2, 3, 0
    ]));
  }

  public draw() {

    this.#camera.update();
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

    //DrAW HERE
    for (let i = 0; i < 50; i++) {
      this.drawSprite(Content.playerTexture, new Rect(
        this.#canvas.width * Math.random(),
        this.#canvas.height * Math.random(),
        100, 100
        ));
    }

    for (let i = 0; i < 50; i++) {
      this.drawSprite(Content.ufoRedTexture, new Rect(
        this.#canvas.width * Math.random(),
        this.#canvas.height * Math.random(),
        100, 100
        ));
    }

    // END DRAW HERE
    this.#passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);

  }
  public drawSprite(texture: Texture, rect: Rect) {

    const spritePipeline = SpritePipeline.create(this.#device, texture, this.#projectviewMatrixBuffer);

    // top left
    this.#vertexData[0] = rect.x;
    this.#vertexData[1] = rect.y;
    this.#vertexData[2] = 0;
    this.#vertexData[3] = 0;
    this.#vertexData[4] = 1.0;
    this.#vertexData[5] = 1.0;
    this.#vertexData[6] = 1.0;

    // top right
    this.#vertexData[7] = rect.x + rect.width;
    this.#vertexData[8] = rect.y;
    this.#vertexData[9] = 1.0;
    this.#vertexData[10] = 0;
    this.#vertexData[11] = 1.0;
    this.#vertexData[12] = 1.0;
    this.#vertexData[13] = 1.0;

    // bottom right
    this.#vertexData[14] = rect.x + rect.width;
    this.#vertexData[15] = rect.y + rect.height;
    this.#vertexData[16] = 1.0;
    this.#vertexData[17] = 1.0;
    this.#vertexData[18] = 1.0;
    this.#vertexData[19] = 1.0;
    this.#vertexData[20] = 1.0;

    // bottom left
    this.#vertexData[21] = rect.x;
    this.#vertexData[22] = rect.y + rect.height;
    this.#vertexData[23] = 0.0;
    this.#vertexData[24] = 1.0;
    this.#vertexData[25] = 1.0;
    this.#vertexData[26] = 1.0;
    this.#vertexData[27] = 1.0;

    const vertexBuffer = BufferUtil.createVertexBuffer(this.#device, this.#vertexData);

    this.#device.queue.writeBuffer(
      this.#projectviewMatrixBuffer,
      0,
      this.#camera.projectionViewMatrix as Float32Array);

    this.#passEncoder.setPipeline(spritePipeline.pipeline);
    this.#passEncoder.setIndexBuffer(this.#IndicesBuffer, 'uint16');
    this.#passEncoder.setVertexBuffer(0, vertexBuffer);
    this.#passEncoder.setBindGroup(0, spritePipeline.projectionViewBindGroup)
    this.#passEncoder.setBindGroup(1, spritePipeline.textureBindGroup)
    this.#passEncoder.drawIndexed(6);

  }

}

const renderer = new Renderer()
renderer.initalize().then(() => {
  renderer.draw();
})