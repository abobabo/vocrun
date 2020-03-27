import * as Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';
import { gameOptions } from './config';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
  scene: [GameScene, GameOverScene],
  type: Phaser.AUTO,

  scale: {
    parent: 'phaser-game',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameOptions.width,
    height: window.innerHeight,
    mode: Phaser.Scale.FIT,
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },

  parent: 'game',
  backgroundColor: '#000000',
  transparent: true,
};

export const game = new Phaser.Game(gameConfig);
