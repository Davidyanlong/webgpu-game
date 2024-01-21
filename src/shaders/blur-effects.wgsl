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

var<private> weights : array<f32, 5> = array(
0.204163688,    //this is sampled only once, middle pixel
0.180173822,    //this is sampled twice, left and right pixel from middle
0.123831536,
0.066282245,
0.027630550
);


@fragment
fn fragmentMainHorizontal(@location(0) texCoord : vec2f) -> @location(0) vec4f
{
    var horizontalTexel = 1.0 / f32(textureDimensions(tex).x);
    var result = textureSample(tex, texSampler, texCoord) * weights[0];

    for(var i = 1; i < 5; i++)
    {
        var offset = vec2f(horizontalTexel * f32(i), 0.0);

        var sampleCoordsRight = texCoord + offset;
        var sampleCoordsLeft = texCoord - offset;

        result += textureSample(tex, texSampler, sampleCoordsRight) * weights[i];
        result += textureSample(tex, texSampler, sampleCoordsLeft) * weights[i];
    }

    return vec4f(result.rgb, 1.0);
}

@fragment
fn fragmentMainVertical(@location(0) texCoord : vec2f) -> @location(0) vec4f
{
    var verticalTexel = 1.0 / f32(textureDimensions(tex).y);
    var result = textureSample(tex, texSampler, texCoord) * weights[0];

    for(var i = 1; i < 5; i++)
    {
        var offset = vec2f(0.0,verticalTexel * f32(i));

        var sampleCoordsUp = texCoord + offset;
        var sampleCoordsDown = texCoord - offset;

        result += textureSample(tex, texSampler, sampleCoordsUp) * weights[i];
        result += textureSample(tex, texSampler, sampleCoordsDown) * weights[i];
    }
    return vec4f(result.rgb, 1.0);
}
