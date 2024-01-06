struct VertexOut {
    @builtin(position) position:vec4f,
    @location(0) color:vec4f
};

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex:u32 )->VertexOut
{
    let pos = array(
        vec2(-0.5, -0.5),
        vec2(0.5, -0.5),
        vec2(0.5, 0.5)
    );

    var output:VertexOut;

    output.position = vec4f(pos[vertexIndex], 0.0,1.0);
    output.color = vec4f(1.0, 0.0, 0.0,1.0);
    return output;
}

@fragment
fn fragmentMain(@location(0) color:vec4f)->@location(0) vec4f
{
    return color;
}