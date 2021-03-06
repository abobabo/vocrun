import * as Phaser from 'phaser';
import { gameOptions } from '../config';

class HeartBar {
  private hearts: Phaser.GameObjects.Group;

  private scene;

  constructor(scene, x, y, width) {
    const heartSprite = new Phaser.Physics.Arcade.Sprite(
      scene,
      0,
      null,
      'heart',
    );
    this.scene = scene;
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

  bringToTop = () => {
    this.hearts.getChildren().forEach(x => this.scene.children.bringToTop(x));
  };

  loseHeart = () => {
    const [lastHeart] = this.hearts.getChildren().slice(-1);
    this.hearts.remove(lastHeart, true, true);
    return this.hearts.getChildren().length;
  };
}

export default HeartBar;
