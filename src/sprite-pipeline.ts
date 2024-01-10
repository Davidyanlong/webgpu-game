import { Texture } from "./texture";
import shaderSource from './shaders/shader.wgsl?raw'
export class SpritePipeline {

    public pipeline!: GPURenderPipeline;
    public textureBindGroup!: GPUBindGroup
    public projectionViewBindGroup!: GPUBindGroup

    public static create(device: GPUDevice, texture: Texture, projectionViewMatrixBuffer: GPUBuffer): SpritePipeline {
        const pipeline = new SpritePipeline()
        pipeline.initialize(device, texture, projectionViewMatrixBuffer);
        return pipeline;
    }
    public initialize(device: GPUDevice, texture: Texture, projectionViewMatrixBuffer: GPUBuffer): void {
        const shaderModule = device.createShaderModule({
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
                        srcFactor: "src-alpha",
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






        const projectViewBindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform"
                }
            }]
        });

        const textureBindGroupLayout = device.createBindGroupLayout({
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

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [
                projectViewBindGroupLayout,
                textureBindGroupLayout,
            ],
        });

        this.textureBindGroup = device.createBindGroup({
            layout: textureBindGroupLayout,
            entries: [{
                binding: 0,
                resource: texture.sampler
            }, {
                binding: 1,
                resource: texture.texture.createView()
            }]
        });




        this.projectionViewBindGroup = device.createBindGroup({
            layout: projectViewBindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: projectionViewMatrixBuffer
                }
            }]
        })



        this.pipeline = device.createRenderPipeline({
            vertex: vertexState,
            fragment: fragmentState,
            primitive: {
                topology: "triangle-list"
            },
            layout: pipelineLayout
        })

    }
}