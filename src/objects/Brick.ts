import { SpriteInterface } from "../interfaces/SpriteInterface";

export class Brick extends Phaser.GameObjects.Image {
    body!: Phaser.Physics.Arcade.Body;

    constructor(aParams: SpriteInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
    }

    public setBody() {
        this.body.setSize(32, 32);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
    }

    update(): void {}

    public destroyBrick() {
        this.destroy();
    }
}