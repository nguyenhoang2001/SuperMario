import { CollectibleInterface } from "../interfaces/CollectibleInterface";

export class Collectible extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;

    // variables
    private currentScene!: Phaser.Scene;
    public points!: number;

    constructor(aParams: CollectibleInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        // variables
        this.currentScene = aParams.scene;
        this.points = aParams.points;
        this.initSprite();
        this.initAnimation(aParams.texture);
    }

    private initSprite() {
        // sprite
        this.setOrigin(0, 0);
        this.setFrame(0);
    }

    private initAnimation(key:string) {
        if(key == 'coin') {
            this.anims.play(key,true);
        }
    }

    public setBody() {
        this.body.setSize(this.width, this.height);
        this.body.setAllowGravity(false);
    }
}