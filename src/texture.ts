export class Texture {

    constructor(public texture: GPUTexture, public sampler: GPUSampler) { }

    public static async createTexture(device: GPUDevice, image: HTMLImageElement): Promise<Texture> {
        const texture = device.createTexture({
            size: {width: image.width,height: image.height},
            format: "rgba8unorm",
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });
        const data = await createImageBitmap(image);
        device.queue.copyExternalImageToTexture(
            { source: data },
            { texture: texture },
            { width: image.width, height: image.height }
        );
        const sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
        })

        return new Texture(texture, sampler);
    }

    public static async createTexureFromURL(device: GPUDevice, url: string): Promise<Texture> {
        const promise = new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.onload = () => resolve(image);
            image.onerror = (e) => () => {
                console.error(`Failed to load image: ${e}`);
                reject(e);
            }
        })

        const image = await promise;
        return Texture.createTexture(device, image);
    }
}