import * as Phaser from 'phaser';
import { gameOptions } from '../config';

class VocabContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, vocab, background, vocabSize) {
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
      {
        font: `${vocabSize}px Arial`,
        fill: 'white',
        align: 'center',
        resolution: 3,
      } as any,
    )
      .setScale(gameOptions.scaleRatio)
      .setOrigin(0.5)
      .setWordWrapWidth(scene.vocabContainerWidth);

    super(scene, x, y, [vocabSprite, vocabText]);
    this.setSize(width, width);
    scene.add.existing(this);
  }

  preload() {}
  create() {}
}

export default VocabContainer;
