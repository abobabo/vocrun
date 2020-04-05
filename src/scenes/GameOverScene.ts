import * as Phaser from 'phaser';
import { gameOptions } from '../config';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'GameOver',
};

const scoreStyle = {
  font: '48px Arial',
  fill: 'black',
  wordWrap: true,
  align: 'center',
  backgroundColor: 'white',
};

const textStyle = {
  font: '16px Arial',
  fill: 'black',
  wordWrap: true,
  align: 'center',
  backgroundColor: 'white',
};

class GameOverScene extends Phaser.Scene {
  private score: number;

  constructor() {
    super(sceneConfig);
  }

  determineReward = (score: number): string => {
    switch (true) {
      case score < 20:
        return 'stones';
      case score < 40:
        return 'spoon';
      default:
        return 'golden turtle';
    }
  };

  init(data) {
    this.score = data.score;
  }

  public preload() {
    this.load.image('replay button', 'assets/img/replaybutton.png');
    this.load.bitmapFont(
      'atarisunset',
      'assets/fonts/atari-sunset.png',
      'assets/fonts/atari-sunset.xml',
    );
  }

  public create() {
    const score = this.add.bitmapText(
      gameOptions.width / 2,
      window.innerHeight / 5,
      'atarisunset',
      `Score: ${String(this.score)}`,
      30,
    );
    score.setOrigin(0.5);
    const button = this.add.sprite(
      gameOptions.width / 2,
      window.innerHeight / 2,
      'replay button',
    );
    button.setOrigin(0.5);
    button.setInteractive().on('pointerdown', () => this.scene.start('Game'));
  }

  public update() {}
}

export default GameOverScene;
