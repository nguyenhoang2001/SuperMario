import { Bullet } from "./Bullet";
import { Mario } from "./Mario";

export class ShootBehavior {
    private parent!:Mario;
    public bullets!: Phaser.GameObjects.Group;

    public setParent(mario:Mario) {
        this.parent = mario;
    }

    public getBullets():Phaser.GameObjects.Group {
        return this.bullets;
    }

    public updateBullets() {
        this.bullets.children.each((_bullet: any) => {
            let bullet = _bullet as Bullet;
            bullet.update();
        },this);
    }

    public shoot(scene:Phaser.Scene,x:number,y:number,velocity:number): Bullet{
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