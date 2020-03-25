import * as Phaser from 'phaser';

const vocabStyle = {
  font: '18px Arial',
  fill: 'white',
  align: 'center',
  resolution: 3,
};

class Hero extends Phaser.GameObjects.Container {
  spikeSprite;
  vocabSourceText;

  constructor(scene, x, y, width, height, vocab, background) {
    const spikeSprite = new Phaser.Physics.Arcade.Sprite(
      scene,
      0,
      -height / 4,
      background,
    );
    spikeSprite.displayWidth = width;
    spikeSprite.displayHeight = height / 2;
    spikeSprite.setOrigin(0.5);

    const vocabSourceText = new Phaser.GameObjects.Text(
      scene,
      0,
      height / 2,
      vocab,
      vocabStyle,
    );
    vocabSourceText.setOrigin(0.5);

    super(scene, x, y, [spikeSprite, vocabSourceText]);
    this.spikeSprite = spikeSprite;
    this.vocabSourceText = vocabSourceText;
    this.setSize(10, height);
    scene.add.existing(this);
  }

  preload() {}
  create() {}
}

export default Hero;
