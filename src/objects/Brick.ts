import { SpriteInterface } from "../interfaces/SpriteInterface";

export class Brick extends Phaser.GameObjects.Image {
    body!: Phaser.Physics.Arcade.Body;

    // variables
    private currentScene!: Phaser.Scene;

    constructor(aParams: SpriteInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
    
        // variables
        this.currentScene = aParams.scene;
        this.initImage();
        // this.currentScene.add.existing(this);
    }

    private initImage() {
        // sprite
        this.setOrigin(0, 0);
    
        // physics
        //this.currentScene.physics.world.enable(this);
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