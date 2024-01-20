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

@group(0) @binding(0)
var texSampler : sampler;

@group(0) @binding(1)
var tex : texture_2d<f32>;


@fragment
fn fragmentMain(@location(0) texCoord : vec2f) -> @location(0) vec4f
{
    var screenTexture = textureSample(tex, texSampler, texCoord);
    var average = (screenTexture.r + screenTexture.g + screenTexture.b) / 3.0;
    return vec4f(average, average, average, 1.0);
}
