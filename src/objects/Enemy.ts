import { SpriteInterface } from "../interfaces/SpriteInterface";

export class Enemy extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;

    // variables
    protected isActivated!: boolean;
    protected isDying!: boolean;
    protected speed!: number;
    public dyingScoreValue!: number;

    constructor(aParams: SpriteInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
        // variables
        this.initSprite();
    }

    protected initSprite() {
        // variables
        this.isActivated = true;
        this.isDying = false;
        // sprite
        this.setFrame(0);
    }

    public setBody() {
        this.body.setSize(32, 32);
        this.body.setGravityY(100);
    }
}