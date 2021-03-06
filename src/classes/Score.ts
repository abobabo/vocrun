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
      0,
      y,
      'atarisunset',
      `Score: ${String(this.score)}`,
      28,
    ).setOrigin(1.0, 1.0);
    scene.add.existing(this.scoreText);
    const widthBeforeScale = this.scoreText.width;
    this.scoreText.setScale(gameOptions.scaleRatio);
    const widthAfterScale = this.scoreText.width;
    this.scoreText.setDisplayOrigin(widthBeforeScale, 0);
    this.scoreText.setX(x);
  }

  increase = () => {
    this.scoreText.setText(
      `Score: ${String((this.score += gameOptions.correctVocabScore))}`,
    );
  };
}

export default Score;
