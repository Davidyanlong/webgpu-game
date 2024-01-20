import { BufferUtil } from "./buffer-util";
import { Texture } from "./texture";
import shaderSource from "./shaders/texture-effect.wgsl?raw";

export class TextureEffect {
    #gpuPipeline!: GPURenderPipeline;
    #gpuBuffer!: GPUBuffer;

    // screen texture
    public screenTexture!: Texture;
    #screenTextureBindGroup!: GPUBindGroup;

    // combine texture
    #combineTexture!: Texture
    #combineTextureBindGroupLayout!: GPUBindGroupLayout;
    #combineTextureBindGroup!: GPUBindGroup;

    // mix
    public mixValue = 0.5;
    #mixValueBuffer!: GPUBuffer;
    #mixValueBindGroup!: GPUBindGroup;


    constructor(private device: GPUDevice,
        public width: number,
        public height: number) { }

    public setCombineTexture(combineTexture: Texture) {
        this.#combineTexture = combineTexture
        this.#combineTextureBindGroup = this.device.createBindGroup({
            layout: this.#combineTextureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.#combineTexture.sampler
                },
                {
                    binding: 1,
                    resource: this.#combineTexture.texture.createView()
                }
            ]
        })


    }

    public async initialize() {
        this.screenTexture = await Texture.createEmptyTexture(this.device, this.width, this.height, 'bgra8unorm');

        this.#gpuBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array([
            // pos(x,y) tex(u,v)

            // first triangle
            // top left 
            -1.0, 1.0, 0.0, 0.0,
            // top right
            1.0, 1.0, 1.0, 0.0,
            // bottom left 
            -1.0, -1.0, 0.0, 1.0,

            // second triangle
            // bottom left
            -1.0, -1.0, 0.0, 1.0,
            // top right
            1.0, 1.0, 1.0, 0.0,
            // bottom right
            1.0, -1.0, 1.0, 1.0
        ]));

        this.#mixValueBuffer = BufferUtil.createUniformBuffer(
            this.device,
            new Float32Array([this.mixValue]));

        const textureBindGroupLayout = this.device.createBindGroupLayout({
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
        this.#combineTextureBindGroupLayout = this.device.createBindGroupLayout({
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
        })

        const mixValueBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                }
            ]
        })

        this.#screenTextureBindGroup = this.device.createBindGroup({
            layout: textureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.screenTexture.sampler
                },
                {
                    binding: 1,
                    resource: this.screenTexture.texture.createView()
                }
            ]
        })

        this.#mixValueBindGroup = this.device.createBindGroup({
            layout: mixValueBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.#mixValueBuffer,
                        offset: 0,
                        size: Float32Array.BYTES_PER_ELEMENT
                    }
                }
            ]
        })

        const shaderModule = this.device.createShaderModule({
            code: shaderSource
        });

        const desc: GPURenderPipelineDescriptor = {
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [
                    textureBindGroupLayout, // group 0
                    this.#combineTextureBindGroupLayout,  // group 1
                    mixValueBindGroupLayout // group 2
                ]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: 'vertexMain',
                buffers: [
                    {
                        arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x2'
                            },
                            {
                                shaderLocation: 1,
                                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                                format: 'float32x2'
                            }
                        ]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragmentMain',
                targets: [
                    {
                        format: 'bgra8unorm'
                    }
                ]
            },
            primitive: {
                topology: 'triangle-list'
            }
        }

        this.#gpuPipeline = this.device.createRenderPipeline(desc);


    }
    public draw(destinationTexture: GPUTextureView) {
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: destinationTexture,
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ]
        });

        this.device.queue.writeBuffer(this.#mixValueBuffer, 0, new Float32Array([this.mixValue]));

        passEncoder.setPipeline(this.#gpuPipeline);
        passEncoder.setVertexBuffer(0, this.#gpuBuffer);
        passEncoder.setBindGroup(0, this.#screenTextureBindGroup);
        passEncoder.setBindGroup(1, this.#combineTextureBindGroup);
        passEncoder.setBindGroup(2, this.#mixValueBindGroup);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}