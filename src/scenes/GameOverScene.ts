import * as Phaser from 'phaser';

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
    this.load.image('stones', 'assets/img/stones.png');
    this.load.image('spoon', 'assets/img/spoon.png');
    this.load.image('golden turtle', 'assets/img/goldenturtle.png');
    this.load.image('replay button', 'assets/img/replaybutton.png');
  }

  public create() {
    const score = this.add.text(
      window.innerWidth / 2,
      window.innerHeight / 5,
      `your score: \n ${String(this.score)}`,
      scoreStyle,
    );
    score.setOrigin(0.5);
    const yourReward = this.add.text(
      window.innerWidth / 2,
      window.innerHeight / 3,
      `your reward:`,
      textStyle,
    );
    yourReward.setOrigin(0.5);
    const reward = this.determineReward(this.score);
    const rewardImg = this.add.sprite(
      window.innerWidth / 2,
      window.innerHeight / 2,
      reward,
    );
    const rewardText = this.add.text(
      window.innerWidth / 2,
      window.innerHeight / 1.5,
      reward,
    );
    rewardText.setOrigin(0.5);
    const button = this.add.sprite(
      window.innerWidth / 2,
      window.innerHeight / 1.2,
      'replay button',
    );
    button.setOrigin(0.5);
    button.setInteractive().on('pointerdown', () => this.scene.start('Game'));
  }

  public update() {}
}

export default GameOverScene;
