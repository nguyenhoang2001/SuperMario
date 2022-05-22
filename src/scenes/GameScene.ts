import { Box } from "../objects/Box";
import { BoxesManager } from "../objects/BoxesManager";
import { Brick } from "../objects/Brick";
import { Collectible } from "../objects/Collectible";
import { Mario } from "../objects/Mario";
import { Portal } from "../objects/Portal";

export class GameScene extends Phaser.Scene {
    // Tile map
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private foreground!: Phaser.Tilemaps.TilemapLayer;
    private objectOnGround!: Phaser.Tilemaps.TilemapLayer;

    // game objects
    private bricks!: Phaser.GameObjects.Group;
    private collectibles!: Phaser.GameObjects.Group;
    private enemies!: Phaser.GameObjects.Group;
    private player!: Mario;
    private portals!: Phaser.GameObjects.Group;
    private boxesManager!: BoxesManager;

    // input
    private keys!: Map<string, Phaser.Input.Keyboard.Key>;

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
        // CAMERA
        this.createCamera();
    }

    update (time:number, delta:number): void {
        this.updatePlayer();
        this.updateBoxes();
        this.updateBricks();
    }

    private updatePlayer() {
        if(!this.player.isDying) {
            this.handleInputs();
            this.player.update();
        } else {
            if (this.player.y > this.sys.canvas.height) {
                this.scene.stop('GameScene');
                // this.scene.stop('HUDScene');
                this.scene.start('MenuScene');
            }
        }
    }

    private updateBricks() {
        this.bricks.children.each((_brick: Brick|any) => {
            if(_brick.body.touching.down && this.player.body.touching.up) {
                console.log('hit the brick');
                if(this.player.marioSize === 'big')
                    _brick.destroy();
            }
        }, this);
    }

    private updateBoxes() {
        this.boxesManager.boxes.children.each((_box: Box|any) => {
            if(_box.body.touching.down && this.player.body.touching.up && _box.active) {
                console.log('hit the box');
                this.playerHitBox(_box);
                //_box.active = false;
            }
        }, this);
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.input.keyboard.addKey(key);
    }

    private createInputs(): void {
        this.keys = new Map([
            ['LEFT', this.addKey('LEFT')],
            ['RIGHT', this.addKey('RIGHT')],
            ['DOWN', this.addKey('DOWN')],
            ['JUMP', this.addKey('UP')]
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
    }

    private createGameObjects(): void {
        this.portals = this.add.group({});
        //this.boxes = this.add.group({});
        this.bricks = this.add.group({});
        this.collectibles = this.add.group({});
        this.enemies = this.add.group({});
        this.boxesManager = new BoxesManager();
        this.boxesManager.boxes = this.add.group({});
        this.loadObjectsFromTilemap();
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
        this.physics.add.collider(this.player, this.bricks);

        this.physics.add.collider(this.player, this.boxesManager.boxes);

        this.physics.add.collider(
            this.player,
            this.portals,
            this.handlePlayerPortal,
            undefined,
            this
        );
        this.physics.add.collider(
            this.player,
            this.collectibles,
            this.handlePlayerCollectibles,
            undefined,
            this
        );
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
                    y: object.y,
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
            else if(object.type === 'brick') {
                let brick = new Brick({
                    scene:this,
                    x:object.x,
                    y:object.y,
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
        });
    }

    private handleInputs() {
        if (this.player.y > this.sys.canvas.height) {
            // mario fell into a hole
            this.player.isDying = true;
        }
    
        // evaluate if player is on the floor or on object
        // if neither of that, set the player to be jumping
        if (
            this.player.body.onFloor() ||
            this.player.body.touching.down ||
            this.player.body.blocked.down
        ) {
            this.player.allowJump = 2;
            this.player.isJumping = false;
        }
        // handle movements to left and right
        if (this.keys.get('RIGHT')?.isDown) {
            this.player.body.setVelocityX(200);
            this.player.setFlipX(false);
        } else if (this.keys.get('LEFT')?.isDown) {
            this.player.body.setVelocityX(-200);
            this.player.setFlipX(true);
        } else {
            this.player.body.setVelocityX(0);
            this.player.body.setAccelerationX(0);
        }
    
        // handle jumping
        if (this.keys.get('JUMP')?.isDown) {
            if(!this.player.isJumping) {
                this.player.body.setVelocityY(-400);
                this.player.isJumping = true;
            }
        }
        if(this.keys.get('JUMP')?.isUp) {
            if(this.player.isJumping) {
                this.player.allowJump -= 1;
                if(this.player.allowJump > 0) {
                    this.player.isJumping = false;
                }
            }
        }
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
    private handlePlayerCollectibles(_player: any, _collectible: any): void {
        let myPlayer = _player as Mario;
        let myCollectible = _collectible as Collectible;
        switch (_collectible.texture.key) {
          case 'flower': {
            break;
          }
          case 'mushroom': {
            myPlayer.growMario();
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

          switch (_box.getBoxContentString()) {
            case 'coin': {
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
}