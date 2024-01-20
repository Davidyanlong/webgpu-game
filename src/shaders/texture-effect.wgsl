struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) texCoord : vec2f

};


@vertex
fn vertexMain(
@location(0) pos : vec2f,
@location(1) texCoord : vec2f
) -> VertexOut
{
    var output : VertexOut;

    output.position = vec4f(pos, 0.0, 1.0);
    output.texCoord = texCoord;

    return output;
}

// this is our scene texture
@group(0) @binding(0)
var texSampler0 : sampler;
@group(0) @binding(1)
var tex0 : texture_2d<f32>;

// this is our combine texture
@group(1) @binding(0)
var texSampler1 : sampler;
@group(1) @binding(1)
var tex1 : texture_2d<f32>;

// mix value
@group(2) @binding(0)
var<uniform> mixValue : f32;

@fragment
fn fragmentMain(@location(0) texCoord : vec2f) -> @location(0) vec4f
{
    var screenTexture = textureSample(tex0, texSampler0, texCoord);
    var combineTexture = textureSample(tex1, texSampler1, texCoord);

    var mixColor = mix(screenTexture.rgb, combineTexture.rgb, mixValue);

    return vec4f(mixColor, 1.0);
}
