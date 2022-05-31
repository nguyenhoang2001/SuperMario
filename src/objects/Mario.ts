import { SpriteInterface } from "../interfaces/SpriteInterface";
import { Bullet } from "./Bullet";
import { CreepBehavior } from "./CreepBehavior";
import { ShootBehavior } from "./ShootBehavior";

export class Mario extends Phaser.GameObjects.Sprite {
    body!: Phaser.Physics.Arcade.Body;
    // variables
    private size!: string;
    private isJumping!: boolean;
    private isDying!: boolean;
    private allowJump!:number;
    private isVulnerable!: boolean;
    private vulnerableCounter!: number;
    public creeping!: boolean;
    private nextPos!: number;
    private countCreeping!:number;
    private shoot!: ShootBehavior;
    private creep!: CreepBehavior;

    constructor(aParams:SpriteInterface) {
        super(aParams.scene,aParams.x,aParams.y,aParams.texture,aParams.frame);
        this.initSprite();
        this.shoot = new ShootBehavior();
        this.shoot.bullets = this.scene.add.group({});
        this.creep = new CreepBehavior();
        this.creep.setParent(this);
        this.shoot.setParent(this);
    }

    public getSize() {
      return this.size;
    }

    public setNextPos(nextPos:number) {
      this.nextPos = nextPos;
    }

    public getIsJumping() {
      return this.isJumping;
    }

    public getIsDying() {
      return this.isDying;
    }

    public getAllowJump() {
      return this.allowJump;
    }

    public creepPipes() {
      this.creep.creep();
    }

    public setNextSpawn(position:number) {
      this.creep.setSpawnX(position);
    }

    public resetAllowJump() {
      this.isJumping = false;
      this.allowJump = 2;
    }

    public reduceJump() {
      this.allowJump -= 1;
    }

    public setIsJumping(state:boolean) {
      this.isJumping = state;
    }

    public setCreeping(state:boolean) {
      this.creeping = state;
    }

    public shootEnemy(velocity:number):Bullet {
      let offset = 0;
      if(this.size == 'small')
        offset = 16;
      let bullet = this.shoot.shoot(this.scene,this.x, this.y + offset,velocity );
      return bullet;
    }

    public updateBullets() {
      this.shoot.updateBullets();
    }

    private initSprite() {
        // variables
        this.size = this.scene.registry.get('marioSize');
        this.isJumping = false;
        this.isDying = false;
        this.isVulnerable = true;
        this.vulnerableCounter = 100;
        this.allowJump = 2;
        this.creeping = false;
        this.nextPos = this.x;
        this.countCreeping = 36;
        // sprite
        this.setFlipX(false);
    }

    public setUpBody() {
        if(this.size === 'small')
            this.adjustPhysicBodyToSmallSize();
        else 
            this.adjustPhysicBodyToBigSize();
        this.body.maxVelocity.x = 300;
        this.body.maxVelocity.y = 1000;
        this.body.setGravityY(150);
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
          if (this.y > this.scene.sys.canvas.height) {
            // mario fell into a hole
            this.isDying = true;
          }
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
          if (this.size === 'small') {
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
            if (this.size === 'small') {
              this.setFrame(3);
            } else {
              this.setFrame(8);
            }
          }
    
          if (this.body.velocity.x > 0) {
            this.anims.play(this.size + 'MarioWalk', true);
          } else {
            this.anims.play(this.size + 'MarioWalk', true);
          }
        } else {
          // mario is standing still
          this.anims.stop();
          if (this.size === 'small') {
            this.setFrame(0);
          } else {
              this.setFrame(5);
          }
        }

        if (this.creeping) {
          if(this.countCreeping <= 0) {
            this.x = this.nextPos;
            this.body.setVelocityY(-400);
            this.creeping = false;
            this.countCreeping = 36;
          }else {
            this.body.checkCollision.none = true;
            this.body.setGravityY(0);
            this.countCreeping -= 1;
          }
        }
        else {
          this.body.setGravityY(150);
          this.body.checkCollision.none = false;
        } 
    }

    public grow(): void {
        this.size = 'big';
        this.scene.registry.set('marioSize', 'big');
        this.adjustPhysicBodyToBigSize();
    }

    private shrink(): void {
        this.size = 'small';
        this.scene.registry.set('marioSize', 'small');
        this.adjustPhysicBodyToSmallSize();
    }

    public getVulnerable(): boolean {
      return this.isVulnerable;
    }

    public gotHit(): void {
        this.isVulnerable = false;
        if (this.size === 'big') {
          this.shrink();
        } else {
          // mario is dying
          this.isDying = true;
        }
    }
}