export class BootScene extends Phaser.Scene {
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private sky!: Phaser.Tilemaps.TilemapLayer;
    private cloud!: Phaser.Tilemaps.TilemapLayer;
    private control!: Phaser.Cameras.Controls.FixedKeyControl;

    preload(): void {
        this.load.image('tiles','./assets/tiles/tiles.png');
        this.load.tilemapTiledJSON('superMario','./assets/maps/superMario.json');
    }

    create(): void {
        this.map = this.make.tilemap({key:"superMario"});
        this.tileset = this.map.addTilesetImage('tiles','tiles');
        this.sky = this.map.createLayer('sky',this.tileset,0,0);
        this.cloud = this.map.createLayer('cloud',this.tileset);
        this.map.createLayer('grass',this.tileset);
        this.map.createLayer('pipe',this.tileset);
        this.map.createLayer('foreground',this.tileset);
        this.map.createLayer('castle',this.tileset);
        this.map.createLayer('stairs',this.tileset);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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