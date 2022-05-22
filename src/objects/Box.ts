import { BoxInterface } from "../interfaces/BoxInterface";
import { Collectible } from "./Collectible";

export class Box extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;
    // variables
    public currentScene!: Phaser.Scene;
    public boxContent!: string;
    public content!: Collectible;
    public hitBoxTimeline!: Phaser.Tweens.Timeline;

    constructor(aParams: BoxInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
    
        // variables
        this.currentScene = aParams.scene;
        this.boxContent = aParams.typeContent;

        this.initSprite();
    }
    public getContent(): Phaser.GameObjects.Sprite {
        return this.content;
    }
    
    public getBoxContentString(): string {
        return this.boxContent;
    }

    private initSprite() {
        // variables
        this.hitBoxTimeline = this.currentScene.tweens.createTimeline({});
        this.setOrigin(0, 0);
        this.setFrame(0);
    }

    public setBody() {
        this.body.setSize(32, 32);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
    }
}