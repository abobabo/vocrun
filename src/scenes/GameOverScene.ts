import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'GameOver',
};

export const gameOptions = {
  barrierStartSpeed: 100,
  barrierTimerDelay: 3000,
  barrierLength: 5,
  vocabContainerWidth: 120,
  heartCount: 3,
  heartWidth: 48,
};

class GameOverScene extends Phaser.Scene {
  private score;

  constructor() {
    super(sceneConfig);
  }

  init(data) {
    this.score = data.score;
    console.log(this.score);
  }

  public preload() {}

  public create() {
    console.log('game over');
  }

  public update() {}
}

export default GameOverScene;
