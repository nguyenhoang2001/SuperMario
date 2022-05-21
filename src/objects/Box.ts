import { BoxInterface } from "../interfaces/BoxInterface";
import { Collectible } from "./Collectible";

export class Box extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;
    // variables
    private currentScene!: Phaser.Scene;
    private boxContent!: string;
    private content!: Collectible;
    private hitBoxTimeline!: Phaser.Tweens.Timeline;

    constructor(aParams: BoxInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
    
        // variables
        this.currentScene = aParams.scene;
        this.boxContent = aParams.typeContent;
    
        this.initSprite();
        //this.currentScene.add.existing(this);
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

    public yoyoTheBoxUpAndDown(): void {
        this.hitBoxTimeline.add({
          targets: this,
          props: { y: this.y - 10 },
          duration: 60,
          ease: 'Power0',
          yoyo: true,
          onComplete: () => {
            // this.targets[0].active = false;
            this.active = false;
            this.setFrame(1);
          }
        });
    }

    public spawnBoxContent(): Collectible {
        console.log('came to this');
        this.content = new Collectible({
          scene: this.currentScene,
          x: this.x + 8,
          y: this.y - 32,
          texture: this.boxContent,
          points: 100
        });
        this.currentScene.physics.world.enable(this.content);
        this.content.setBody();
        this.currentScene.add.existing(this.content);
        return this.content;
    }

    public tweenBoxContent(
        props: {},
        duration: number,
        complete: () => void
      ): void {
        this.hitBoxTimeline.add({
          targets: this.content,
          props: props,
          delay: 0,
          duration: duration,
          ease: 'Power0',
          onComplete: complete
        });
    }
    // outside
    public startHitTimeline(): void {
        this.hitBoxTimeline.play();
    }

    public popUpCollectible(): void {
        this.content.body.setVelocity(30, -50);
        this.content.body.setAllowGravity(true);
        this.content.body.setGravityY(-300);
    }

    // outside
    public addCoinAndScore(coin: number, score: number): void {
        this.currentScene.registry.values.coins += coin;
        this.currentScene.events.emit('coinsChanged');
        this.currentScene.registry.values.score += score;
        this.currentScene.events.emit('scoreChanged');
    }
}