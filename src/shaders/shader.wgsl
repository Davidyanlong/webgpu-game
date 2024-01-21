struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) texCoord : vec2f,
    @location(1) color : vec4f,

};

@group(0) @binding(0)
var<uniform> projectionViewMatrix : mat4x4f;

@vertex
fn vertexMain(
@location(0) pos : vec2f,
@location(1) texCoord : vec2f,
@location(2) color : vec3f,

) -> VertexOut
{
    var output : VertexOut;

    output.position = projectionViewMatrix * vec4f(pos, 0.0, 1.0);
    output.color = vec4f(color, 1.0);
    output.texCoord = texCoord;
    return output;
}

@group(1) @binding(0)
var texSampler : sampler;

@group(1) @binding(1)
var tex : texture_2d<f32>;

struct FragmentOut {
    @location(0) color : vec4f,
    @location(1) brightness : vec4f,
};

const brightnessThreshold : f32 = 0.4;

@fragment
fn fragmentMain(@location(0) texCoord : vec2f, @location(1) color : vec4f) -> FragmentOut
{
    var out : FragmentOut;
    var textureColor = textureSample(tex, texSampler, texCoord) * color;

    out.color = textureColor;
    var l = dot(textureColor.rgb, vec3f(0.299, 0.587, 0.114));

    if(l > brightnessThreshold)
    {
        out.brightness = textureColor;
    }else{
        out.brightness = vec4f(0.0, 0.0, 0.0, textureColor.a);
    }

    return out;
}
