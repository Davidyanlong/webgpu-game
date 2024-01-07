import shaderSource from './shader/shader.wgsl?raw'
import { QuadGeometry } from './geometry';
import { Texture } from './texture';
import { BufferUtil } from './buffer-util';
class Renderer {
  #context!: GPUCanvasContext;
  #device!: GPUDevice;
  #pipline!: GPURenderPipeline;
  #vertexBuffer!: GPUBuffer;
  #IndicesBuffer!: GPUBuffer;
  #textureBindGroup!: GPUBindGroup;
  #testTexture!: Texture;

  constructor() {
  }
  public async initalize() {
    const canvas = document.getElementById("canvasDom") as HTMLCanvasElement;
    this.#context = canvas.getContext("webgpu") as GPUCanvasContext;
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

    const format = navigator.gpu.getPreferredCanvasFormat();

    this.#context.configure({
      device: this.#device,
      format
    })

    this.#testTexture = await Texture.createTexureFromURL(this.#device, "./assets/awesomeface.png");
    this.prepareModel()

    const geometry = new QuadGeometry();


    this.#vertexBuffer = BufferUtil.createVertexBuffer(this.#device, new Float32Array(geometry.vertices));

    this.#IndicesBuffer = BufferUtil.createIndexBuffer(this.#device, new Uint16Array(geometry.indices));

  }

  private prepareModel() {
    const shaderModule = this.#device.createShaderModule({
      code: shaderSource
    });

    const bufferLayout: GPUVertexBufferLayout = {
      arrayStride: 7 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2"
        },
        {
          shaderLocation: 1,
          offset: 2 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x2"
        },
        {
          shaderLocation: 2,
          offset: 4 * Float32Array.BYTES_PER_ELEMENT,
          format: "float32x3"
        },
      ],
      stepMode: "vertex"
    }

    const vertexState: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        bufferLayout
      ]
    }

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat(),
        blend: {
          color: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha",
            operation: "add"
          },
          alpha: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha",
            operation: "add"
          }
        }
      }]
    };

    const textureBindGroupLayout = this.#device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {}
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {}
        }
      ]
    });


    const pipelineLayout = this.#device.createPipelineLayout({
      bindGroupLayouts: [
        textureBindGroupLayout
      ],
    });

    this.#textureBindGroup = this.#device.createBindGroup({
      layout: textureBindGroupLayout,
      entries: [{
        binding: 0,
        resource: this.#testTexture.sampler
      }, {
        binding: 1,
        resource: this.#testTexture.texture.createView()
      }]
    });


    this.#pipline = this.#device.createRenderPipeline({
      vertex: vertexState,
      fragment: fragmentState,
      primitive: {
        topology: "triangle-list"
      },
      layout: pipelineLayout
    })

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

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescription);
    passEncoder.setPipeline(this.#pipline);
    passEncoder.setIndexBuffer(this.#IndicesBuffer,'uint16');
    passEncoder.setVertexBuffer(0, this.#vertexBuffer);
    passEncoder.setBindGroup(0, this.#textureBindGroup)
    passEncoder.drawIndexed(6);
    passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);

  }

}

const renderer = new Renderer()
renderer.initalize().then(() => {
  renderer.draw();
})