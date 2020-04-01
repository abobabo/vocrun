import * as Phaser from 'phaser';
import { gameOptions } from '../config';

const scoreStyle = {
  font: '16px Arial',
  fill: 'white',
  align: 'center',
};

class Score {
  private scoreText: Phaser.GameObjects.BitmapText;
  private score: number = 0;

  getScoreText = () => {
    return this.scoreText;
  };

  getScore = () => {
    return this.score;
  };

  constructor(scene, x, y) {
    this.scoreText = new Phaser.GameObjects.BitmapText(
      scene,
      x,
      y,
      'atarisunset',
      `Score: ${String(this.score)}`,
      28,
    );
    this.scoreText.setOrigin(1.0);
    scene.add.existing(this.scoreText);
  }

  increase = () => {
    this.scoreText.setText(
      `Score: ${String((this.score += gameOptions.correctVocabScore))}`,
    );
  };
}

export default Score;
