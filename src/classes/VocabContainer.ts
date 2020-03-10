import * as Phaser from 'phaser';

const vocabStyle = {
  font: '16px Arial',
  fill: '#ff0044',
  align: 'center',
};

class VocabContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, displayWidth, vocabText) {
    const platform = new Phaser.Physics.Arcade.Sprite(
      scene,
      0,
      null,
      'platform',
    );
    platform.displayHeight = displayWidth;
    platform.displayWidth = displayWidth;

    const text = new Phaser.GameObjects.Text(
      scene,
      0,
      0,
      vocabText,
      vocabStyle,
    );
    text.setOrigin(0.5);

    super(scene, x, y, [platform, text]);
    scene.add.existing(this);
  }

  preload() {}
  create() {}
}

export default VocabContainer;
