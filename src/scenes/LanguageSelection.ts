import * as Phaser from 'phaser';
import { gameOptions } from '../config';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'LanguageSelection',
};

const languages = ['French', 'German', 'Mandarin', 'Spanish'];

class LanguageSelection extends Phaser.Scene {
  languageGroup: Phaser.GameObjects.Group = new Phaser.GameObjects.Group(this);

  constructor() {
    super(sceneConfig);
  }

  public preload() {
    this.load.image('vocab', 'assets/img/platform.png');
    this.load.bitmapFont(
      'atarisunset',
      'assets/fonts/atari-sunset.png',
      'assets/fonts/atari-sunset.xml',
    );
  }

  public create() {
    languages.forEach(x => {
      const text = this.add
        .bitmapText(0, 0, 'atarisunset', x, 30)
        .setOrigin(1.0);
      text
        .setInteractive()
        .on('pointerdown', () =>
          this.scene.start('Game', { score: `${text}` }),
        );
      this.languageGroup.add(text);
    });
    this.languageGroup.setOrigin(0.5);
    console.log(this.languageGroup.getChildren());
    const container = Phaser.Actions.GridAlign(
      this.languageGroup.getChildren(),
      {
        width: 1,
        height: languages.length,
        cellWidth: 30,
        cellHeight: 50,
        x: gameOptions.width / 2,
        y: gameOptions.height / 2 - 100,
      },
    );
  }

  public update() {}
}

export default LanguageSelection;
