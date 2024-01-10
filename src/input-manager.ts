export class InputManger {
    #keysDown: { [key: string]: boolean } = {};

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.#keysDown[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.#keysDown[e.key] = false;
        });
    }

    public isKeyDown(key: string): boolean {
        return this.#keysDown[key];
    }

    public isKeyUp(key: string): boolean {
        return!this.#keysDown[key];
    }
}