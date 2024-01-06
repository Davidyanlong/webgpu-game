import shaderSource from './shader/shader.wgsl?raw'

class Renderer {
  #context!: GPUCanvasContext;
  #device!: GPUDevice;
  #pipline!: GPURenderPipeline;
  #positionBuffer!: GPUBuffer;
  #colorBuffer!: GPUBuffer;

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
    this.#positionBuffer = this.createBuffer(new Float32Array([
      -0.5, -0.5,
       0.5,  -0.5, 
       -0.5,  0.5,
       -0.5,  0.5,
       0.5,  0.5,
       0.5,  -0.5

    ]));

    this.#colorBuffer = this.createBuffer(new Float32Array([
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ]));


  }

  private createBuffer(data: Float32Array): GPUBuffer {

    const buffer = this.#device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    
    new Float32Array(buffer.getMappedRange()).set(data);

    buffer.unmap();

    return buffer;
  }


  private prepareModel() {
    const shaderModule = this.#device.createShaderModule({
      code: shaderSource
    });

    const positionBufferLayout:GPUVertexBufferLayout ={
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2"
        },
      ],
      stepMode: "vertex"
    }

    const colorBufferLayout:GPUVertexBufferLayout ={
      arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 1,
                offset: 0,
                format: "float32x3"
              },
            ],
            stepMode: "vertex"
    }

    const vertexState: GPUVertexState = {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        positionBufferLayout,
        colorBufferLayout
      ]
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
    passEncoder.setVertexBuffer(0, this.#positionBuffer);
    passEncoder.setVertexBuffer(1, this.#colorBuffer);
    passEncoder.draw(6, 1, 0, 0);
    passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);

  }

}

const renderer = new Renderer()
renderer.initalize().then(() => {
  renderer.draw();
})