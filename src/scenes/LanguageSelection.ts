import * as Phaser from 'phaser';
import { gameOptions } from '../config';
import French from '../../assets/vocab/french.json';
import Mandarin from '../../assets/vocab/mandarin.json';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'LanguageSelection',
};

const languages = { French: French, Mandarin: Mandarin };

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
    for (let [key, value] of Object.entries(languages)) {
      const text = this.add
        .bitmapText(0, 0, 'atarisunset', key, 30)
        .setOrigin(1.0);
      text
        .setInteractive()
        .on('pointerdown', () =>
          this.scene.start('Game', { vocabulary: value }),
        );
      this.languageGroup.add(text);
    }
    this.languageGroup.setOrigin(0.5);
    const container = Phaser.Actions.GridAlign(
      this.languageGroup.getChildren(),
      {
        width: 1,
        height: 2,
        cellWidth: 0,
        cellHeight: 50,
        x: gameOptions.width / 2,
        y: gameOptions.height / 2 - 100,
      },
    );
  }

  public update() {}
}

export default LanguageSelection;
