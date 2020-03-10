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
  font: '16px Arial',
  fill: '#ff0044',
  wordWrap: true,
  align: 'center',
};

const heroStyle = {
  font: '14px Arial',
  fill: 'black',
  wordWrap: true,
  align: 'center',
  backgroundColor: 'white',
};

class GameScene extends Phaser.Scene {
  private hero: Phaser.GameObjects.Rectangle & {
    body: Phaser.Physics.Arcade.Body;
  };

  private vocabCount: number;

  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super(sceneConfig);
    this.vocabCount = 0;
  }

  addBarrier = () => {};

  addPlatform = (displayWidth: number = 40) => {
    // add platfrom sprite
    let platform;
    platform = this.physics.add.sprite(0, 0, 'platform');
    platform.setImmovable(true);
    platform.displayHeight = displayWidth;
    platform.displayWidth = displayWidth;
    // add platform text
    const text = this.add.text(
      0,
      0,
      hsk4vocab[this.vocabCount].hanzi as string,
      vocabStyle,
    );
    text.setOrigin(0.5);
    // put together in container
    const vocabContainer = this.add.container(window.innerWidth / 2, 10, [
      platform,
      text,
    ]);
    vocabContainer.setSize(128, 64);
    // move container towards hero
    this.physics.world.enable(vocabContainer);
    const body = vocabContainer.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(sceneOptions.platformStartSpeed);
    // explode container when coliding with hero
    body.checkCollision.up = true;
    body.checkCollision.down = true;
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
      this.emitter.explode(50, this.hero.x, this.hero.y);
      vocabContainer.destroy();
      this.vocabCount += 1;
    };
    this.physics.add.collider(
      this.hero,
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
    this.hero = this.add.text(
      window.innerWidth / 2,
      window.innerHeight - 50,
      'vocab',
      heroStyle,
    ) as any;
    this.hero.setOrigin(0.5);
    this.physics.add.existing(this.hero);
    const platformTimer = this.time.addEvent({
      delay: sceneOptions.platformTimerDelay,
      callback: this.addPlatform,
      loop: true,
    });
  }

  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    if (cursorKeys.right.isDown) {
      this.hero.body.setVelocityX(500);
    } else if (cursorKeys.left.isDown) {
      this.hero.body.setVelocityX(-500);
    } else {
      this.hero.body.setVelocityX(0);
    }
  }
}

export default GameScene;
