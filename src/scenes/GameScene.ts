import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body;
  };

  private text: Phaser.GameObjects.Text;

  constructor() {
    super(sceneConfig);
  }

  public create() {
    const style = {
      font: '32px Arial',
      fill: '#ff0044',
      wordWrap: true,
      align: 'center',
      backgroundColor: '#ffff00',
    };
    this.square = this.add.text(400, 400, 'VocabGoesHere', style) as any;
    this.physics.add.existing(this.square);
  }

  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    const what = this.square as any;
    const style = {
      font: '32px Arial',
      fill: '#ff0044',
      wordWrap: true,
      align: 'center',
      backgroundColor: '#ffff00',
    };
    if (cursorKeys.right.isDown) {
      this.square.body.setVelocityX(500);
    } else if (cursorKeys.left.isDown) {
      this.square.body.setVelocityX(-500);
    } else {
      this.square.body.setVelocityX(0);
    }
  }
}

export default GameScene;
