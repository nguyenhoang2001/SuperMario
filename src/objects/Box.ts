import { BoxInterface } from "../interfaces/BoxInterface";
import { Collectible } from "./Collectible";

export class Box extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;
    // variables
    private boxContent!: string;
    public content!: Collectible;
    public hitBoxTimeline!: Phaser.Tweens.Timeline;

    constructor(aParams: BoxInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
    
        // variables
        this.boxContent = aParams.typeContent;

        this.initSprite();
    }

    public getContent(): Phaser.GameObjects.Sprite {
        return this.content;
    }
    
    public getBoxContent(): string {
        return this.boxContent;
    }

    private initSprite() {
        // variables
        this.hitBoxTimeline = this.scene.tweens.createTimeline({});
        this.setFrame(0);
    }

    public setBody() {
        this.body.setSize(32, 32);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
    }
}