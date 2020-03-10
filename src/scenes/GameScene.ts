import * as Phaser from 'phaser';
import hsk4vocab from '../../assets/vocab/hsk4.json';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let sceneOptions = {
  platformStartSpeed: 150,
  platformTimerDelay: 2000,
};

const style = {
  font: '32px Arial',
  fill: '#ff0044',
  wordWrap: true,
  align: 'center',
  backgroundColor: '#ffff00',
};

class GameScene extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body;
  };

  private platformGroup: Phaser.GameObjects.Group;

  private vocabCount: number;

  constructor() {
    super(sceneConfig);
    this.vocabCount = 0;
  }

  collide = () => {
    console.log('collision!');
  };

  addPlatform = (displayWidth: number = 40) => {
    let platform;
    platform = this.physics.add.sprite(0, 0, 'platform');
    const text = this.add.text(
      0,
      0,
      hsk4vocab[this.vocabCount].hanzi as string,
      style,
    );
    text.setOrigin(0.5);
    platform.setImmovable(true);
    this.platformGroup.add(platform);
    platform.displayHeight = displayWidth;
    platform.displayWidth = displayWidth;
    const container = this.add.container(window.innerWidth / 2, 10, [
      platform,
      text,
    ]);
    container.setSize(128, 64);
    this.physics.world.enable(container);
    const body = container.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(sceneOptions.platformStartSpeed);
    body.checkCollision.up = true;
    body.checkCollision.down = true;
    this.vocabCount += 1;
    this.physics.add.collider(this.square, platform, this.collide, null, this);
  };

  public preload() {
    this.load.image('platform', 'assets/img/platform.png');
  }

  public create() {
    this.square = this.add.text(
      window.innerWidth / 2,
      window.innerHeight - 50,
      'VocabGoesHere',
      style,
    ) as any;
    this.square.setOrigin(0.5);
    this.physics.add.existing(this.square);
    this.platformGroup = this.add.group({
      removeCallback: function(platform: any) {
        platform.scene.platformGroup.add(platform);
      },
    });
    const platformTimer = this.time.addEvent({
      delay: sceneOptions.platformTimerDelay,
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
