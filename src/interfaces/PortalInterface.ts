import { PortalDestinationInterface } from "./PortalDestinationInterface";

export interface PortalInterface {
    scene: Phaser.Scene;
    spawn: PortalDestinationInterface;
    x: number;
    y: number;
    width?: number;
    height?: number;
}