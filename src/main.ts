import shaderSource from './shader/shader.wgsl?raw'

class Renderer {
  #context!: GPUCanvasContext;
  #device!: GPUDevice;
  #pipline!: GPURenderPipeline;

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
    this.prepareModel()
  }

  private prepareModel() {
    const shaderModule = this.#device.createShaderModule({
      code: shaderSource
    });

    const vertexState: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: []
    }

    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat()
      }]
    };

    this.#pipline = this.#device.createRenderPipeline({
      vertex: vertexState,
      fragment: fragmentState,
      primitive: {
        topology: "triangle-list"
      },
      layout: 'auto'
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
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);

  }

}

const renderer = new Renderer()
renderer.initalize().then(() => {
  renderer.draw();
})