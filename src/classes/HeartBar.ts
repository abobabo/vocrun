import * as Phaser from 'phaser';
import { gameOptions } from '../scenes/GameScene';

const vocabStyle = {
  font: '16px Arial',
  fill: '#ff0044',
  align: 'center',
};

class HeartBar {
  private hearts: Phaser.GameObjects.Group;

  constructor(scene, x, y, width) {
    const heartSprite = new Phaser.Physics.Arcade.Sprite(
      scene,
      0,
      null,
      'heart',
    );
    heartSprite.displayHeight = width;
    heartSprite.displayWidth = width;
    this.hearts = scene.physics.add.group({ immovable: true });

    for (var i = 0; i < gameOptions.heartCount; i++) {
      const heart = this.hearts.create(x + width * i, y, 'heart');
      scene.physics.add.existing(heart);
      heart.body.setImmovable();
      heart.setOrigin(0.0);
    }
    scene.add.existing(this);
  }
}

export default HeartBar;
