export class BootScene extends Phaser.Scene {
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private sky!: Phaser.Tilemaps.TilemapLayer;
    private control!: Phaser.Cameras.Controls.FixedKeyControl;

    preload(): void {
        this.load.pack('preload', './assets/pack.json', 'preload');
    }

    create(): void {
        this.map = this.make.tilemap({key:"superMario"});
        this.tileset = this.map.addTilesetImage('tiles','tiles');
        this.sky = this.map.createLayer('sky',this.tileset,0,0);
        this.map.createLayer('foreground',this.tileset);
        this.map.createLayer('decoration',this.tileset);
        this.map.createLayer('objectOnGround',this.tileset);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        const objects = this.map.getObjectLayer('objects').objects as any[];
        objects.forEach((object) => {
            if (object.type === 'mario') {
                let mario = this.add.sprite(object.x,object.y,'mario');
                mario.setOrigin(0,0);
            }
        });
        var cursors = this.input.keyboard.createCursorKeys();
        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.5
        };
        this.control = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
    }

    update (time:number, delta:number): void {
        this.control.update(delta);
    }
}