import * as Phaser from 'phaser';

const vocabStyle = {
  font: '18px Arial',
  fill: '#ff0044',
  align: 'center',
  resolution: 3,
};

class VocabContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, vocab, background) {
    const vocabSprite = new Phaser.Physics.Arcade.Sprite(
      scene,
      0,
      null,
      background,
    );
    vocabSprite.displayHeight = width;
    vocabSprite.displayWidth = width;

    const vocabText = new Phaser.GameObjects.Text(
      scene,
      0,
      0,
      vocab,
      vocabStyle,
    );
    vocabText.setOrigin(0.5);

    super(scene, x, y, [vocabSprite, vocabText]);
    this.setSize(width, width);
    scene.add.existing(this);
  }

  preload() {}
  create() {}
}

export default VocabContainer;
