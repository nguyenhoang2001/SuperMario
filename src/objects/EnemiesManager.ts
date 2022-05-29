import { Goomba } from "./Goomba";

export class EnemiesManager {
    public goombas!: Phaser.GameObjects.Group;

    public addGoomba(scene: Phaser.Scene, x:number,y:number):Goomba {
        let goomba = new Goomba({
            scene:scene,
            x:x,
            y:y,
            texture:'goomba'
        });
        this.goombas.add(goomba);
        return goomba;
    }

    public updateGoombas(): void {
        this.goombas.children.each((_goomba: any) => {
            let goomba = _goomba as Goomba;
            goomba.update();
        },this);
    }

    public showAndAddScore(goomba:Goomba): void {
        let scoreText = goomba.scene.add
          .dynamicBitmapText(
            goomba.x,
            goomba.y - 20,
            'font',
            goomba.dyingScoreValue.toString(),
            10
          )
          .setOrigin(0, 0);
    
          goomba.scene.add.tween({
          targets: scoreText,
          props: { y: scoreText.y - 25 },
          duration: 800,
          ease: 'Power0',
          yoyo: false,
          onComplete: function () {
            scoreText.destroy();
          }
        });
    }
}