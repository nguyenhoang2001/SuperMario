import { Box } from "./Box";
import { Collectible } from "./Collectible";

export class BoxesManager {
    public boxes!: Phaser.GameObjects.Group;

    public addBox(scene:Phaser.Scene, typeContent:string, x:number, y:number): Box {
        let box = new Box({
            scene:scene,
            typeContent: typeContent,
            x:x,
            y:y,
            texture:'box'
        });
        this.boxes.add(box);
        return box;
    }

    public yoyoTheBoxUpAndDown(box:Box): void {
        box.hitBoxTimeline.add({
            targets: box,
            props: { y: box.y - 10},
            duration: 120,
            ease: 'Power0',
            yoyo: true,
            onComplete: () => {
                box.active = false;
                box.setFrame(1);
            }
        });
    }

    public tweenBoxContent(box:Box,
        props: {},
        duration: number,
        complete: () => void
      ): void {
        box.hitBoxTimeline.add({
          targets: box.content,
          props: props,
          delay: 0,
          duration: duration,
          ease: 'Power0',
          onComplete: complete
        });
    }

    public spawnBoxContent(box:Box): Collectible {
        box.content = new Collectible({
            scene: box.currentScene,
            x: box.x + 8,
            y: box.y - 32,
            texture: box.boxContent,
            points: 100
        });
        return box.content;
    }

    public startHitTimeline(box:Box): void {
        box.hitBoxTimeline.play();
    }

    public popUpCollectible(box:Box): void {
        box.content.body.setVelocity(30, -50);
        box.content.body.setAllowGravity(true);
        box.content.body.setGravityY(-300);
    }
}