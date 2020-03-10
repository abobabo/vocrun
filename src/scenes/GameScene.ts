import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let sceneOptions = {
  platformStartSpeed: 350,
};

class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body;
  };

  private platformGroup: Phaser.GameObjects.Group;

  constructor() {
    super(sceneConfig);
  }

  addPlatform = (displayWidth: number = 200) => {
    let platform;
    platform = this.physics.add.sprite(window.innerWidth / 2, 10, 'platform');
    platform.setImmovable(true);
    platform.setVelocityY(sceneOptions.platformStartSpeed);
    this.platformGroup.add(platform);
    platform.displayWidth = displayWidth;
  };

  public preload() {
    this.load.image('platform', 'assets/platform.png');
  }

  public create() {
    const style = {
      font: '32px Arial',
      fill: '#ff0044',
      wordWrap: true,
      align: 'center',
      backgroundColor: '#ffff00',
    };
    this.square = this.add.text(
      window.innerWidth / 2 - 100,
      400,
      'VocabGoesHere',
      style,
    ) as any;
    this.physics.add.existing(this.square);
    this.platformGroup = this.add.group({
      removeCallback: function(platform: any) {
        platform.scene.platformGroup.add(platform);
      },
    });
    const platformTimer = this.time.addEvent({
      delay: 1000,
      callback: this.addPlatform,
      loop: true,
    });
  }

  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();

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
