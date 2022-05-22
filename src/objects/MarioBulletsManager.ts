import { Bullet } from "./Bullet";

export class MarioBulletsManager {
    public bullets!: Phaser.GameObjects.Group;

    public updateMarioBullets() {
        this.bullets.children.each((_bullet: any) => {
            let bullet = _bullet as Bullet;
            bullet.update();
        },this);
    }

    public addBullet(scene:Phaser.Scene,x:number,y:number,velocity:number):Bullet {
        let bullet = new Bullet({
            scene:scene,
            x:x,
            y:y,
            texture:'bullet'
        },velocity);
        this.bullets.add(bullet);
        return bullet;
    }
}