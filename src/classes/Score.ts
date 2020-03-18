import * as Phaser from 'phaser';
import { gameOptions } from '../scenes/GameScene';

const scoreStyle = {
  font: '16px Arial',
  fill: 'white',
  align: 'center',
};

class Score {
  private scoreDisplay: Phaser.GameObjects.Text;
  private score: number = 0;
  constructor(scene, x, y) {
    this.scoreDisplay = new Phaser.GameObjects.Text(
      scene,
      x,
      y,
      String(this.score),
      scoreStyle,
    );
    scene.physics.add.existing(this.scoreDisplay);
    this.scoreDisplay.setOrigin(1.0);
    scene.add.existing(this.scoreDisplay);
  }

  increase = () => {
    this.scoreDisplay.setText(
      String((this.score += gameOptions.correctVocabScore)),
    );
  };
}

export default Score;
