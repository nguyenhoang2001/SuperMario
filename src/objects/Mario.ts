import { SpriteInterface } from "../interfaces/SpriteInterface";

export class Mario extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;
    // variables
    private currentScene!: Phaser.Scene;
    private marioSize!: string;
    public acceleration!: number;
    public isJumping!: boolean;
    public isDying!: boolean;
    public allowJump!:number;
    private isVulnerable!: boolean;
    private vulnerableCounter!: number;


    constructor(aParams:SpriteInterface) {
        super(aParams.scene,aParams.x,aParams.y,aParams.texture,aParams.frame);
        this.currentScene = aParams.scene;
        this.initSprite();
    }

    private initSprite() {
        // variables
        //this.marioSize = this.currentScene.registry.get('marioSize');
        this.acceleration = 500;
        this.isJumping = false;
        this.isDying = false;
        this.isVulnerable = true;
        this.vulnerableCounter = 100;
        this.allowJump = 3;
        // sprite
        this.setOrigin(0, 0);
        this.setFlipX(false);
    }

    public setUpBody() {
        this.adjustPhysicBodyToSmallSize();
        this.body.maxVelocity.x = 300;
        this.body.maxVelocity.y = 300;
    }

    private adjustPhysicBodyToSmallSize(): void {
        this.body.setSize(32, 32);
    }
}