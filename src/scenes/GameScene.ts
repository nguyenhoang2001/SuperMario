import { Box } from "../objects/Box";
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
    private boxes!: Phaser.GameObjects.Group;
    private bricks!: Phaser.GameObjects.Group;
    private collectibles!: Phaser.GameObjects.Group;
    private enemies!: Phaser.GameObjects.Group;
    private player!: Mario;
    private portals!: Phaser.GameObjects.Group;

    // input
    private keys!: Map<string, Phaser.Input.Keyboard.Key>;

    //variables
    private hitBoxTimeline!: Phaser.Tweens.Timeline;

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
        // VARIABLES
        this.createVariables();
    }

    update (time:number, delta:number): void {
        this.updatePlayer();
        this.updateBox();
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
            if(_brick.body.touching.down) {
                console.log('hit the brick');
                if(this.player.marioSize === 'big')
                    _brick.destroy();
            }
        }, this);
    }

    private updateBox() {
        this.boxes.children.each((_box: Box|any) => {
            if(_box.body.touching.down & _box.active) {
                console.log('hit the box');
                this.playerHitBox(this.player,_box);
                _box.active = false;
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

    private createVariables(): void {
        // variables
        this.hitBoxTimeline = this.tweens.createTimeline({});
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
        this.boxes = this.add.group({});
        this.bricks = this.add.group({});
        this.collectibles = this.add.group({});
        this.enemies = this.add.group({});
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
        this.physics.add.collider(this.player, this.boxes);

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
                let box = new Box({
                    scene:this,
                    typeContent: object.properties[0].value,
                    x:object.x,
                    y:object.y,
                    texture:'box'
                });
                this.physics.world.enable(box);
                box.setBody();
                this.add.existing(box);
                this.boxes.add(box);
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

    private handlePlayerPortal(_player: Mario|any, _portal: Portal|any): void {
        if (
          (this.keys.get('DOWN')?.isDown &&
            _portal.getPortalDestination().dir === 'down') ||
          (this.keys.get('RIGHT')?.isDown &&
            _portal.getPortalDestination().dir === 'right')
        ) {
          // set new level and new destination for mario
          this.registry.set('level', _portal.name);
          this.registry.set('spawn', {
            x: _portal.getPortalDestination().x,
            y: _portal.getPortalDestination().y,
            dir: _portal.getPortalDestination().dir
          });
    
          // restart the game scene
          this.scene.restart();
        } else if (_portal.name === 'exit') {
          this.scene.stop('GameScene');
        //   this.scene.stop('HUDScene');
          this.scene.start('MenuScene');
        }
    }
    private handlePlayerCollectibles(_player: Mario|any, _collectible: Collectible|any): void {
        switch (_collectible.texture.key) {
          case 'flower': {
            break;
          }
          case 'mushroom': {
            _player.growMario();
            break;
          }
          case 'star': {
            break;
          }
          default: {
            break;
          }
        }
        _collectible.destroy();
        this.registry.values.score += _collectible.points;
        this.events.emit('scoreChanged');
    }

    private playerHitBox(_player: Mario|any, _box: Box|any): void {
        if (_box.body.touching.down && _box.active) {
           
          // ok, mario has really hit a box on the downside
          _box.yoyoTheBoxUpAndDown();
          this.collectibles.add(_box.spawnBoxContent());
          switch (_box.getBoxContentString()) {
            // have a look what is inside the box! Christmas time!
            case 'coin': {
              _box.tweenBoxContent({ y: _box.y - 40, alpha: 0 }, 700,() => {
                _box.getContent().destroy();
              });
              this.registry.values.coins += 1;
              this.events.emit('coinsChanged');
              this.registry.values.score += 100;
              this.events.emit('scoreChanged');
              break;
            }
            case 'mushroom': {
              _box.popUpCollectible();
              break;
            }
            default: {
              break;
            }
          }
          _box.startHitTimeline();
        }
    }
}