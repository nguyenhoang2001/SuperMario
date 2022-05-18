export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Super Mario',
  version: '1.0.0',
  width: 800,
  height: 600,
  backgroundColor: 0x3a404d,
  type: Phaser.AUTO,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 475 },
      debug: false
    }
  },
  scene: []
};
