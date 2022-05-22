import { SpriteInterface } from "../interfaces/SpriteInterface";

export class Bullet extends Phaser.GameObjects.Image {
    body!: Phaser.Physics.Arcade.Body;

    private bulletSpeed!: number;

    constructor(aParams: SpriteInterface, velocity:number) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture);
        this.bulletSpeed = velocity;
        this.initImage();
        //this.scene.add.existing(this);
    }

    private initImage() {
        // image
        this.setOrigin(0, 0);

        // physics
        //this.scene.physics.world.enable(this);
    }

    public setBody() {
        this.body.setAllowGravity(false);
        this.body.setVelocityX(this.bulletSpeed);
        this.body.setSize(9,8);
    }

    public update(): void {
        if (this.y < 0 || this.y > this.scene.sys.canvas.height) {
          this.destroy();
        }
    }
}