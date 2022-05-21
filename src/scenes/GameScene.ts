import { Mario } from "../objects/Mario";

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
        if(!this.player.isDying) {
            this.handleInputs();
        }
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
        this.map = this.make.tilemap({key:"superMario"});
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
    }

    private createCollider(): void {
        this.physics.add.collider(this.player, this.foreground);
        this.physics.add.collider(this.player, this.objectOnGround);
    }

    private loadObjectsFromTilemap(): void {
        // get the object layer in the tilemap named 'objects'
        const objects = this.map.getObjectLayer('objects').objects as any[];
        objects.forEach((object) => {
            if (object.type === 'mario') {
                this.player = new Mario({
                  scene: this,
                  x: object.x,
                  y: 400,
                  texture: 'mario'
                });
                this.physics.world.enable(this.player);
                this.player.setUpBody();
                this.add.existing(this.player);
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
            this.player.body.setVelocityX(300);
            this.player.setFlipX(false);
        } else if (this.keys.get('LEFT')?.isDown) {
            this.player.body.setVelocityX(-300);
            this.player.setFlipX(true);
        } else {
            this.player.body.setVelocityX(0);
            this.player.body.setAccelerationX(0);
        }
    
        // handle jumping
        if (this.keys.get('JUMP')?.isDown) {
            if(!this.player.isJumping) {
                this.player.body.setVelocityY(-600);
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
}