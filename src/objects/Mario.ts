import { SpriteInterface } from "../interfaces/SpriteInterface";

export class Mario extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;
    // variables
    private currentScene!: Phaser.Scene;
    public marioSize!: string;
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
        this.marioSize = this.currentScene.registry.get('marioSize');
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
        if(this.marioSize === 'small')
            this.adjustPhysicBodyToSmallSize();
        else 
            this.adjustPhysicBodyToBigSize();
        this.body.maxVelocity.x = 300;
        this.body.maxVelocity.y = 300;
    }

    private adjustPhysicBodyToSmallSize(): void {
        this.body.setSize(28, 32);
        this.body.setOffset(0,32);
    }

    private adjustPhysicBodyToBigSize(): void {
        this.body.setSize(28, 64);
        this.body.setOffset(0,0);
    }

    public update(): void {
        if(!this.isDying) {
            this.handleAnimations();
        } else {

        }
        if (!this.isVulnerable) {
            if (this.vulnerableCounter > 0) {
              this.vulnerableCounter -= 1;
            } else {
              this.vulnerableCounter = 100;
              this.isVulnerable = true;
            }
        }
    }

    private handleAnimations(): void {
        if (this.body.velocity.y !== 0) {
          // mario is jumping or falling
          this.anims.stop();
          if (this.marioSize === 'small') {
            this.setFrame(4);
          } else {
            this.setFrame(9);
          }
        } else if (this.body.velocity.x !== 0) {
          // mario is moving horizontal
    
          // check if mario is making a quick direction change
          if (
            (this.body.velocity.x < 0 && this.body.acceleration.x > 0) ||
            (this.body.velocity.x > 0 && this.body.acceleration.x < 0)
          ) {
            if (this.marioSize === 'small') {
              this.setFrame(3);
            } else {
              this.setFrame(8);
            }
          }
    
          if (this.body.velocity.x > 0) {
            this.anims.play(this.marioSize + 'MarioWalk', true);
          } else {
            this.anims.play(this.marioSize + 'MarioWalk', true);
          }
        } else {
          // mario is standing still
          this.anims.stop();
          if (this.marioSize === 'small') {
            this.setFrame(0);
          } else {
              this.setFrame(5);
          }
        }
    }
    public growMario(): void {
        this.marioSize = 'big';
        this.currentScene.registry.set('marioSize', 'big');
        this.adjustPhysicBodyToBigSize();
    }

    private shrinkMario(): void {
        this.marioSize = 'small';
        this.currentScene.registry.set('marioSize', 'small');
        this.adjustPhysicBodyToSmallSize();
    }

    public bounceUpAfterHitEnemyOnHead(): void {
        this.currentScene.add.tween({
            targets: this,
            props: { y: this.y - 5 },
            duration: 200,
            ease: 'Power1',
            yoyo: true
        });
    }

    public gotHit(): void {
        this.isVulnerable = false;
        if (this.marioSize === 'big') {
          this.shrinkMario();
        } else {
          // mario is dying
          this.isDying = true;
    
          // sets acceleration, velocity and speed to zero
          // stop all animations
          this.body.stop();
          this.anims.stop();
    
          // make last dead jump and turn off collision check
          this.body.setVelocityY(-180);
    
          // this.body.checkCollision.none did not work for me
          this.body.checkCollision.up = false;
          this.body.checkCollision.down = false;
          this.body.checkCollision.left = false;
          this.body.checkCollision.right = false;
        }
    }
}