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

const vocabStyle = {
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

  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super(sceneConfig);
    this.vocabCount = 0;
  }

  addPlatform = (displayWidth: number = 40) => {
    let platform;
    platform = this.physics.add.sprite(0, 0, 'platform');
    const text = this.add.text(
      0,
      0,
      hsk4vocab[this.vocabCount].hanzi as string,
      vocabStyle,
    );
    text.setOrigin(0.5);
    platform.setImmovable(true);
    this.platformGroup.add(platform);
    platform.displayHeight = displayWidth;
    platform.displayWidth = displayWidth;
    const vocabContainer = this.add.container(window.innerWidth / 2, 10, [
      platform,
      text,
    ]);
    vocabContainer.setSize(128, 64);
    this.physics.world.enable(vocabContainer);
    const body = vocabContainer.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(sceneOptions.platformStartSpeed);
    body.checkCollision.up = true;
    body.checkCollision.down = true;
    this.vocabCount += 1;

    const explodeOnCollide = () => {
      this.emitter = this.particles.createEmitter({
        frame: 0,
        x: 400,
        y: 300,
        speed: 200,
        frequency: 100,
        lifespan: 600,
        gravityY: 10,
      });
      this.emitter.explode(50, this.square.x, this.square.y);
      vocabContainer.destroy();
    };

    this.physics.add.collider(
      this.square,
      platform,
      explodeOnCollide,
      null,
      this,
    );
  };

  public preload() {
    this.load.spritesheet('particles', 'assets/img/platform.png', {
      frameWidth: 10,
      frameHeight: 10,
    });
    this.load.image('platform', 'assets/img/platform.png');
  }

  public create() {
    this.particles = this.add.particles('particles');
    this.square = this.add.text(
      window.innerWidth / 2,
      window.innerHeight - 50,
      'VocabGoesHere',
      vocabStyle,
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
