import * as Phaser from 'phaser';
import { VocabRoll } from '../classes';
import VocabContainer from '../classes/VocabContainer';
import hsk4vocab from '../../assets/vocab/hsk4.json';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let sceneOptions = {
  barrierStartSpeed: 100,
  barrierTimerDelay: 3000,
  barrierLength: 5,
  vocabContainerWidth: 80,
};

const heroStyle = {
  font: '14px Arial',
  fill: 'black',
  wordWrap: true,
  align: 'center',
  backgroundColor: 'white',
};

class GameScene extends Phaser.Scene {
  private hero: Phaser.GameObjects.Text & {
    body: Phaser.Physics.Arcade.Body;
    text: Phaser.GameObjects.Text;
  };

  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private vocabQueue: number[] = [];

  constructor() {
    super(sceneConfig);
  }

  prepareBarrier = () => {
    const rolledVocabIds = this.rollVocabIds(sceneOptions.barrierLength);
    const vocabRoll = this.setCorrectdVocab(rolledVocabIds);
    this.addBarrier(vocabRoll);
  };

  rollVocabIds = (vocabAmount: number): VocabRoll[] => {
    const vocabIdRoll: any[] = [];
    while (vocabIdRoll.length < vocabAmount) {
      const roll = Math.floor(Math.random() * hsk4vocab.length);
      if (vocabIdRoll.indexOf(roll) === -1) vocabIdRoll.push(roll);
    }
    const henlo = vocabIdRoll.map(x => {
      return {
        vocabId: x,
      };
    });
    return henlo;
  };

  setCorrectdVocab = (vocabRoll: VocabRoll[]): VocabRoll[] => {
    const vocabRollWithCorrectVocab = Object.assign({}, vocabRoll);
    const correctVocabIndex = Math.floor(Math.random() * vocabRoll.length);
    vocabRollWithCorrectVocab[correctVocabIndex].correct = true;
    this.vocabQueue.push(correctVocabIndex);
    console.log('pushed to queue' + JSON.stringify(this.vocabQueue));
    return vocabRollWithCorrectVocab;
  };

  addBarrier = (vocabRoll: VocabRoll[]) => {
    const barrierContainer = this.add.container(window.innerWidth / 2, 10, []);
    barrierContainer.setSize(
      sceneOptions.vocabContainerWidth * sceneOptions.barrierLength,
      sceneOptions.vocabContainerWidth,
    );
    for (let i = 0; i < sceneOptions.barrierLength; i++) {
      const vocabContainer = new VocabContainer(
        this,
        -(barrierContainer.width / 2) +
          sceneOptions.vocabContainerWidth / 2 +
          sceneOptions.vocabContainerWidth * i,
        0,
        sceneOptions.vocabContainerWidth,
        hsk4vocab[vocabRoll[i].vocabId].hanzi as string,
      );
      this.physics.world.enable(vocabContainer);
      this.addHeroCollision(vocabContainer, this.correctVocabCollision);
      barrierContainer.add(vocabContainer);
    }
    this.moveTowardsHero(barrierContainer, sceneOptions.barrierStartSpeed);
  };

  addHeroCollision = (
    gameObject: Phaser.GameObjects.GameObject,
    explodeOnCollide: any,
  ) => {
    this.physics.add.collider(
      this.hero,
      gameObject,
      explodeOnCollide,
      null,
      this,
    );
  };

  correctVocabCollision = (
    hero: Phaser.GameObjects.GameObject,
    vocabContainer: Phaser.GameObjects.GameObject,
  ) => {
    this.emitter.explode(50, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    const currentInQueue = this.vocabQueue.shift();
    this.hero.setText(hsk4vocab[currentInQueue].translations[0]);
  };

  moveTowardsHero = (
    gameObject: Phaser.GameObjects.GameObject,
    speed: number,
  ) => {
    this.physics.world.enable(gameObject);
    const body = gameObject.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setVelocityY(speed);
  };

  public preload() {
    this.load.spritesheet('particles', 'assets/img/platform.png', {
      frameWidth: 10,
      frameHeight: 10,
    });
    this.load.image('vocabSprite', 'assets/img/platform.png');
  }

  public create() {
    this.particles = this.add.particles('particles');
    this.emitter = this.particles.createEmitter({
      frame: 0,
      x: 400,
      y: 300,
      speed: 200,
      frequency: 100,
      lifespan: 600,
      gravityY: 10,
    });
    this.hero = this.add.text(
      window.innerWidth / 2,
      window.innerHeight - 50,
      'vocab',
      heroStyle,
    ) as any;
    this.hero.setOrigin(0.5);
    this.physics.add.existing(this.hero);
    this.hero.body.setImmovable(true);
    const barrierTimer = this.time.addEvent({
      delay: sceneOptions.barrierTimerDelay,
      callback: this.prepareBarrier,
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
