import { BootScene } from "./scenes/BootScene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Super Mario',
  version: '1.0.0',
  width: 800,
  height: 832,
  backgroundColor: 0x3a404d,
  type: Phaser.AUTO,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: 'game',
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 475 },
      debug: false
    }
  },
  render: { antialias: false },
  scene: [BootScene]
};
