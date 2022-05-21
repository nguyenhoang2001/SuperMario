import { AnimationHelper } from "../helpers/AnimationHelper";

export class BootScene extends Phaser.Scene {
    private animationHelperInstance!: AnimationHelper;
    // graphics
    private loadingBar!: Phaser.GameObjects.Graphics;
    private progressBar!: Phaser.GameObjects.Graphics;

    constructor() {
        super({
          key: 'BootScene'
        });
    }

    preload(): void {
        this.cameras.main.setBackgroundColor(0x000000);
        this.createLoadingGraphics();
        this.load.on(
            'progress',
            (value: number) => {
              this.progressBar.clear();
              this.progressBar.fillStyle(0x88e453, 1);
              this.progressBar.fillRect(
                this.cameras.main.width / 4,
                this.cameras.main.height / 2 - 16,
                (this.cameras.main.width / 2) * value,
                16
              );
            },
            this
        );
        this.load.on(
            'complete',
            () => {
              this.animationHelperInstance = new AnimationHelper(
                this,
                this.cache.json.get('animationJSON')
              );
              this.progressBar.destroy();
              this.loadingBar.destroy();
            },
            this
          );
        this.load.pack('preload', './assets/pack.json', 'preload');
    }

    update (time:number, delta:number): void {
        this.scene.start('GameScene');
    }

    private createLoadingGraphics(): void {
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0xffffff, 1);
        this.loadingBar.fillRect(
          this.cameras.main.width / 4 - 2,
          this.cameras.main.height / 2 - 18,
          this.cameras.main.width / 2 + 4,
          20
        );
        this.progressBar = this.add.graphics();
    }
}