import { Box } from "../objects/Box";
import { BoxesManager } from "../objects/BoxesManager";
import { Brick } from "../objects/Brick";
import { Bullet } from "../objects/Bullet";
import { Collectible } from "../objects/Collectible";
import { CreepBehavior } from "../objects/CreepBehavior";
import { EnemiesManager } from "../objects/EnemiesManager";
import { Goomba } from "../objects/Goomba";
import { Mario } from "../objects/Mario";
import { Portal } from "../objects/Portal";
import { ShootBehavior } from "../objects/ShootBehavior";

export class GameScene extends Phaser.Scene {
    // Tile map
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private foreground!: Phaser.Tilemaps.TilemapLayer;
    private objectOnGround!: Phaser.Tilemaps.TilemapLayer;
    // Game objects
    private bricks!: Phaser.GameObjects.Group;
    private collectibles!: Phaser.GameObjects.Group;
    private player!: Mario;
    private portals!: Phaser.GameObjects.Group;
    private boxesManager!: BoxesManager;
    private enemiesManager!: EnemiesManager;
    private shootMonsters!: ShootBehavior;
    private creepPipes!: CreepBehavior;
    private pipePortals!: Phaser.GameObjects.Group;
    // Input
    private keys!: Map<string, Phaser.Input.Keyboard.Key>;
    // Game Sound
    private endSound!: Phaser.Sound.BaseSound;
    private coinSound!: Phaser.Sound.BaseSound;
    // Variables
    private lastShoot!: number;
    private directionBullet!:number;
    private allowShoot!: boolean;
    private allowTele!: boolean;

    constructor() {
        super({
            key:'GameScene'
        });
    }

    create(): void {
        // SETUP TILEMAP
        this.createTileMap();
        // SETUP INPUTS
        this.createInputs();
        // GAME OBJECTS
        this.createGameObjects();
        // COLLIDERS
        this.createCollider();
        // OVERLAP
        this.createOverlap();
        // CAMERA
        this.createCamera();
        // SOUND
        this.createSound();
        // VARIABLES
        this.createVariables();
    }

    update (time:number, delta:number): void {
        this.updatePlayer();
        this.updateEnemies();
        //this.updatePlayerBullets();
    }

    private updatePlayer() {
        if(!this.player.getIsDying()) {
            this.handleInputs();
            this.player.update();
            this.player.updateBullets();
        } else {
            if (this.player.y > this.sys.canvas.height) {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
            }
        }
    }

    private updateEnemies() {
        this.enemiesManager.updateGoombas();
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.input.keyboard.addKey(key);
    }

    private createInputs(): void {
        this.keys = new Map([
            ['LEFT', this.addKey('LEFT')],
            ['RIGHT', this.addKey('RIGHT')],
            ['DOWN', this.addKey('DOWN')],
            ['JUMP', this.addKey('UP')],
            ['SHOOT', this.addKey('SPACE')]
        ]);
    }

    private createTileMap(): void {
        this.map = this.make.tilemap({key:this.registry.get('level')});
        this.tileset = this.map.addTilesetImage('tiles','tiles');
        this.map.createLayer('sky',this.tileset,0,0);
        this.foreground = this.map.createLayer('foreground',this.tileset);
        this.map.createLayer('decoration',this.tileset);
        this.objectOnGround = this.map.createLayer('objectOnGround',this.tileset);

        this.foreground.setName('foreground');
        this.foreground.setCollisionByProperty({ collide: true });
        this.objectOnGround.setName('objectOnGround');
        this.objectOnGround.setCollisionByProperty({ collide: true });
        this.foreground.depth = 1;
        this.objectOnGround.depth = 1;
    }

    private createGameObjects(): void {
        this.portals = this.add.group({});
        this.bricks = this.add.group({});
        this.collectibles = this.add.group({});
        this.pipePortals = this.add.group({});
        this.enemiesManager = new EnemiesManager();
        this.enemiesManager.goombas = this.add.group({});
        this.boxesManager = new BoxesManager();
        this.boxesManager.boxes = this.add.group({});
        this.shootMonsters = new ShootBehavior();
        this.shootMonsters.bullets = this.add.group({});
        this.creepPipes = new CreepBehavior();
        this.loadObjectsFromTilemap();
        this.shootMonsters.setParent(this.player);
        this.creepPipes.setParent(this.player);
    }

    private createCamera(): void {
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels
        );
        this.cameras.main.zoomTo(1.2);
    }

    private createCollider(): void {
        this.physics.add.collider(this.player, this.foreground);
        this.physics.add.collider(this.player, this.objectOnGround);
        this.enemiesCollision();
        this.playerBoxesCollision();
        this.playerBricksCollision();
        this.playerGoombasCollision();
        this.physics.add.collider(
            this.player,
            this.collectibles,
            this.handlePlayerCollectibles,
            undefined,
            this
        );
    }

    private createOverlap() {
        this.physics.add.overlap(
            this.player,
            this.portals,
            this.handlePlayerPortal,
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.pipePortals,
            this.handlePlayerPipePortal,
            undefined,
            this
        );
    }

    private createSound() {
        this.endSound = this.sound.add('crowdSad',{loop:false,volume:0.5});
        this.coinSound = this.sound.add('dingSound',{loop:false,volume:0.5});
    }

    private createVariables() {
        this.lastShoot = 0;
        this.directionBullet = 1;
        this.allowShoot = true;
        this.allowTele = true;
    }

    private enemiesCollision(): void {
        this.enemiesManager.goombas.children.each((_goomba: any) => {
            let goomba = _goomba as Goomba;
            this.physics.add.collider(goomba,this.foreground);
            this.physics.add.collider(goomba,this.objectOnGround);
            this.enemiesBricksCollision(goomba);
            this.enemiesBoxesCollision(goomba);
        },this);
    }

    private enemiesBricksCollision(goomba:Goomba) {
        this.bricks.children.each((_brick: any) => {
            let brick = _brick as Brick;
            this.physics.add.collider(goomba,brick);
        }, this);
    }

    private enemiesBoxesCollision(goomba:Goomba) {
        this.boxesManager.boxes.children.each((_box: any) => {
            let box = _box as Box;
            this.physics.add.collider(goomba,box);
        }, this);
    }

    private playerBoxesCollision(): void {
        this.boxesManager.boxes.children.each((_box: any) => {
            let box = _box as Box;
            this.physics.add.collider(
                this.player,
                box,
                () => {
                    if(box.body.touching.down && box.active) {
                        console.log('hit the box');
                        this.playerHitBox(box);
                        box.active = false;
                    }
                },
                undefined,
                this
            );
        }, this);
    }

    private playerBricksCollision(): void {
        this.bricks.children.each((_brick: any) => {
            let brick = _brick as Brick;
            this.physics.add.collider(
                this.player,
                brick,
                () => {
                    if(brick.body.touching.down) {
                        console.log('hit the brick');
                        if(this.player.getSize() === 'big')
                            brick.destroy();
                    }
                },
                undefined,
                this
            );
        }, this);
    }

    private playerGoombasCollision(): void {
        this.enemiesManager.goombas.children.each((_goomba: any) => {
            let goomba = _goomba as Goomba;
            this.physics.add.collider(
                this.player,
                goomba,
                () => {
                    this.handlePlayerEnemy(this.player,goomba);
                },
                undefined,
                this
            );
        },this);
    }

    private loadObjectsFromTilemap(): void {
        // get the object layer in the tilemap named 'objects'
        const objects = this.map.getObjectLayer('objects').objects as any[];
        objects.forEach((object) => {
            if (object.type === 'mario') {
                this.player = new Mario({
                  scene: this,
                  x: object.x,
                  y: object.y,
                  texture: 'mario'
                });
                this.physics.world.enable(this.player);
                this.player.setUpBody();
                this.add.existing(this.player);
            }
            else if (object.type === 'portal') {
                let portal = new Portal({
                    scene: this,
                    x: object.x,
                    y: object.y + 48,
                    height: object.width,
                    width: object.height,
                    spawn: {
                      x: object.properties[1].value,
                      y: object.properties[2].value,
                      dir: object.properties[0].value
                    }
                  }).setName(object.name);
                this.physics.world.enable(portal);
                portal.setUpBody();
                this.add.existing(portal);
                this.portals.add(portal);
            }
            else if (object.type == 'pipePortal') {
                let pipePortal = new Portal({
                    scene: this,
                    x: object.x,
                    y: object.y + 16,
                    height: object.width,
                    width: object.height,
                    spawn: {
                      x: object.properties[1].value,
                      y: object.properties[2].value,
                      dir: object.properties[0].value
                    }
                  }).setName(object.name);
                this.physics.world.enable(pipePortal);
                pipePortal.setUpBody();
                this.add.existing(pipePortal);
                this.pipePortals.add(pipePortal);
            }
            else if(object.type === 'brick') {
                let brick = new Brick({
                    scene:this,
                    x:object.x,
                    y:object.y + 16,
                    texture:'brick'
                });
                this.physics.world.enable(brick);
                brick.setBody();
                this.add.existing(brick);
                this.bricks.add(brick);
            }
            else if (object.type === 'collectible') {
                let collectible = new Collectible({
                    scene: this,
                    x: object.x,
                    y: object.y,
                    texture: object.properties[0].value,
                    points: 100
                });
                this.physics.world.enable(collectible);
                collectible.setBody();
                this.add.existing(collectible);
                this.collectibles.add(collectible);
            }
            else if (object.type === 'box') {
                let box = this.boxesManager.addBox(this,object.properties[0].value,object.x,object.y);
                this.physics.world.enable(box);
                box.setBody();
                this.add.existing(box);
            }
            else if (object.type === 'goomba') {
                let goomba = this.enemiesManager.addGoomba(this,object.x,object.y);
                this.physics.world.enable(goomba);
                goomba.setBody();
                this.add.existing(goomba);
            }
        });
    }

    private handleInputs() {
        // evaluate if player is on the floor or on object
        // if neither of that, set the player to be jumping
        if (
            this.player.body.onFloor() ||
            this.player.body.touching.down ||
            this.player.body.blocked.down
        ) {
            this.player.resetAllowJump();
        }
        // handle movements to left and right
        if (this.keys.get('RIGHT')?.isDown) {
            this.directionBullet = 1;
            this.player.body.setVelocityX(200);
            this.player.setFlipX(false);
        } else if (this.keys.get('LEFT')?.isDown) {
            this.directionBullet = -1;
            this.player.body.setVelocityX(-200);
            this.player.setFlipX(true);
        } else {
            this.player.body.setVelocityX(0);
            this.player.body.setAccelerationX(0);
        }
    
        // handle jumping
        if (this.keys.get('JUMP')?.isDown) {
            if(!this.player.getIsJumping()) {
                this.player.body.setVelocityY(-300);
                this.player.setIsJumping(true);
            }
        }
        if(this.keys.get('JUMP')?.isUp) {
            if(this.player.getIsJumping()) {
                this.player.reduceJump();
                if(this.player.getAllowJump() > 0) {
                    this.player.setIsJumping(false);
                }
            }
        }

        // handle shooting
        if(this.keys.get('SHOOT')?.isDown ) {
            if(this.time.now > this.lastShoot && this.allowShoot) {
                let bullet = this.player.shootEnemy(this.directionBullet*700);
                this.physics.world.enable(bullet);
                bullet.setBody();
                this.add.existing(bullet);
                // collision for bullet
                this.createBulletCollision(bullet);
                this.bulletEnemiesCollision(bullet);
                this.lastShoot = this.time.now + 20;
                this.allowShoot = false;
            }
        }
        if(this.keys.get('SHOOT')?.isUp && !this.allowShoot) {
            this.allowShoot = true;
        }
    }

    private createBulletCollision(bullet:Bullet) {
        this.physics.add.collider(bullet,this.foreground,()=>{bullet.destroy();});
        this.physics.add.collider(bullet,this.objectOnGround,()=>{bullet.destroy();});
        this.bricks.children.each((_brick: any) => {
            let brick = _brick as Brick;
            this.physics.add.collider(bullet,brick,()=>{bullet.destroy();});
        }, this);
        this.boxesManager.boxes.children.each((_box: any) => {
            let box = _box as Box;
            this.physics.add.collider(bullet,box,()=>{bullet.destroy();});
        }, this);
    }

    private bulletEnemiesCollision(bullet:Bullet) {
        this.enemiesManager.goombas.children.each((_goomba: any) => {
            let goomba = _goomba as Goomba;
            this.physics.add.collider(
                bullet,
                goomba,
                () => {
                    bullet.destroy();
                    goomba.gotHitFromBullet();
                    this.registry.values.score += goomba.dyingScoreValue;
                    this.events.emit('scoreChanged');
                    this.enemiesManager.showAndAddScore(goomba);
                    this.add.tween({
                        targets: goomba,
                        props: { alpha: 0 },
                        duration: 1000,
                        ease: 'Power0',
                        yoyo: false,
                        onComplete: function () {
                            goomba.isDead();
                        }
                    });
                }
            )
        },this);
    }

    private handlePlayerPortal(_player: any, _portal: any): void {
        let myPlayer = _player as Mario;
        let myPortal = _portal as Portal;
        if (
          (this.keys.get('DOWN')?.isDown &&
          myPortal.getPortalDestination().dir === 'down') ||
          (this.keys.get('RIGHT')?.isDown &&
          myPortal.getPortalDestination().dir === 'right')
        ) {
          // set new level and new destination for mario
          this.registry.set('level', myPortal.name);
          this.registry.set('spawn', {
            x: myPortal.getPortalDestination().x,
            y: myPortal.getPortalDestination().y,
            dir: myPortal.getPortalDestination().dir
          });
    
          // restart the game scene
          this.scene.restart();
        } else if (myPortal.name === 'exit') {
          this.scene.stop('GameScene');
        //   this.scene.stop('HUDScene');
          this.scene.start('MenuScene');
        }
    }

    private handlePlayerPipePortal(_player: any, _pipePortal: any) {
        let myPlayer = _player as Mario;
        let myPipePortal = _pipePortal as Portal;
        if (
            (this.keys.get('DOWN')?.isDown &&
            myPipePortal.getPortalDestination().dir === 'down' && this.allowTele)
          ) {  
                this.allowTele = false;
                // this.creepPipes.setSpawnX(myPipePortal.getPortalDestination().x + 16);
                // this.creepPipes.creep();
                this.player.setNextSpawn(myPipePortal.getPortalDestination().x + 16);
                this.player.creepPipes();
          }
        if (this.keys.get('DOWN')?.isUp && !this.allowTele) {
            this.allowTele = true;
        }
    }

    private handlePlayerCollectibles(_player: any, _collectible: any): void {
        let myPlayer = _player as Mario;
        let myCollectible = _collectible as Collectible;
        switch (_collectible.texture.key) {
          case 'flower': {
            break;
          }
          case 'coin': {
            this.coinSound.stop();
            this.coinSound.play();
            break;
          }
          case 'mushroom': {
            myPlayer.grow();
            break;
          }
          case 'star': {
            break;
          }
          default: {
            break;
          }
        }
        myCollectible.destroy();
        this.registry.values.score += _collectible.points;
        this.events.emit('scoreChanged');
    }

    private playerHitBox(_box: Box): void {
        if (_box.body.touching.down && _box.active) {
          this.boxesManager.yoyoTheBoxUpAndDown(_box);
          this.boxesManager.spawnBoxContent(_box);

          this.physics.world.enable(_box.content);
          _box.content.setBody();
          this.add.existing(_box.content);
          this.collectibles.add(_box.content);

          switch (_box.getBoxContent()) {
            case 'coin': {
              this.coinSound.stop();
              this.coinSound.play();
              this.boxesManager.tweenBoxContent(_box,{ y: _box.y - 40, alpha: 0 }, 700,() => {
                _box.getContent().destroy();
              });
              this.registry.values.coins += 1;
              this.events.emit('coinsChanged');
              this.registry.values.score += 100;
              this.events.emit('scoreChanged');
              break;
            }
            case 'mushroom': {
              this.boxesManager.popUpCollectible(_box);
              break;
            }
            default: {
              break;
            }
          }
          this.boxesManager.startHitTimeline(_box);
        }
    }

    private handlePlayerEnemy(_player: Mario, _enemy: Goomba): void {
        if (_player.body.touching.down && _enemy.body.touching.up) {
          // player hit enemy on top
          this.add.tween({
            targets: _player,
            props: { y: _player.y - 5 },
            duration: 200,
            ease: 'Power1',
            yoyo: true
          });

          _enemy.gotHitOnHead();

          this.registry.values.score += _enemy.dyingScoreValue;
          this.events.emit('scoreChanged');
          this.enemiesManager.showAndAddScore(_enemy);
          
          this.add.tween({
            targets: _enemy,
            props: { alpha: 0 },
            duration: 1000,
            ease: 'Power0',
            yoyo: false,
            onComplete: function () {
              _enemy.isDead();
            }
          });
        } else {
          if (_player.getVulnerable()) {
            // sets acceleration, velocity and speed to zero
            // stop all animations
            if(_player.getSize() == 'small') {
                this.endSound.play();
                _player.body.stop();
                _player.anims.stop();
                // make last dead jump and turn off collision check
                _player.body.setVelocityY(-180);
                _player.body.checkCollision.up = false;
                _player.body.checkCollision.down = false;
                _player.body.checkCollision.left = false;
                _player.body.checkCollision.right = false;
            }
            _player.gotHit();
          }
        }
      }
}