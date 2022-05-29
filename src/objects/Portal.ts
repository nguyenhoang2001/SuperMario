import { PortalDestinationInterface } from "../interfaces/PortalDestinationInterface";
import { PortalInterface } from "../interfaces/PortalInterface";

export class Portal extends Phaser.GameObjects.Zone {
    body!: Phaser.Physics.Arcade.Body;

    // variables
    private portalDestinationForMario!: PortalDestinationInterface;

    public getPortalDestination(): PortalDestinationInterface {
        return this.portalDestinationForMario;
    }

    constructor(aParams: PortalInterface) {
        super(aParams.scene, aParams.x, aParams.y, aParams.width, aParams.height);
        // variables
        this.portalDestinationForMario = aParams.spawn;
    }
    
    public setUpBody() {
      this.body.setSize(32, 96);
      this.body.setOffset(0, 0);
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
    }
    
    update(): void {}
}