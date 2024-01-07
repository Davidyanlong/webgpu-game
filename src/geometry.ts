export class QuadGeometry {
    public vertices: number[]
    public indices: number[]

    constructor() {

        this.vertices = [
            // x y           u v         r g b
            -0.5, -0.5,    0.0, 1.0,     1.0, 1.0, 1.0,
            0.5, -0.5,     1.0, 1.0,     1.0, 1.0, 1.0,
            -0.5, 0.5,     0.0, 0.0,     1.0, 1.0, 1.0,
            0.5, 0.5,      1.0, 0.0,     1.0, 1.0, 1.0,  
        ]
        this.indices = [
            0, 1, 2,
            1, 2, 3
        ]
    }
}