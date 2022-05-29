import { Mario } from "./Mario";

export class CreepBehavior {
    private parent!: Mario;
    private spawnX!: number;

    public setParent(mario:Mario) {
        this.parent = mario;
    }

    public creep() {
        this.parent.setCreeping(true);
        this.parent.setNextPos(this.spawnX);
    }

    public setSpawnX(spawnX:number) {
        this.spawnX = spawnX;
    }

}