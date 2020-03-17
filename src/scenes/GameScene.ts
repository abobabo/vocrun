import * as Phaser from 'phaser';
import { VocabRoll } from '../classes';
import VocabContainer from '../classes/VocabContainer';
import HeartBar from '../classes/HeartBar';
import hsk4vocab from '../../assets/vocab/hsk4.json';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export const gameOptions = {
  barrierStartSpeed: 100,
  barrierTimerDelay: 3000,
  barrierLength: 5,
  vocabContainerWidth: 120,
  heartCount: 3,
  heartWidth: 48,
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

  private blooddrops: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private goldrings: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private wrongVocabEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private correctVocabEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private vocabQueue: number[] = [];

  private heartBar: HeartBar;

  constructor() {
    super(sceneConfig);
  }

  prepareBarrier = () => {
    const rolledVocabIds = this.rollVocabIds(gameOptions.barrierLength);
    const vocabRoll = this.setCorrectVocab(rolledVocabIds);
    this.addBarrier(vocabRoll);
  };

  rollVocabIds = (vocabAmount: number): VocabRoll[] => {
    const vocabIdRoll: any[] = [];
    while (vocabIdRoll.length < vocabAmount) {
      const roll = Math.floor(Math.random() * hsk4vocab.length);
      if (vocabIdRoll.indexOf(roll) === -1) vocabIdRoll.push(roll);
    }
    const vocabRoll = vocabIdRoll.map(x => {
      return {
        vocabId: x,
      };
    });
    return vocabRoll;
  };

  setCorrectVocab = (vocabRoll: VocabRoll[]): VocabRoll[] => {
    const vocabRollWithCorrectVocab = Object.assign({}, vocabRoll);
    const correctVocabIndex = Math.floor(Math.random() * vocabRoll.length);
    vocabRollWithCorrectVocab[correctVocabIndex].correct = true;
    this.vocabQueue.push(vocabRollWithCorrectVocab[correctVocabIndex].vocabId);
    if (!this.hero.text) {
      const currentInQueue = this.vocabQueue.shift();
      this.hero.setText(hsk4vocab[currentInQueue].translations[0]);
    }
    return vocabRollWithCorrectVocab;
  };

  addBarrier = (vocabRoll: VocabRoll[]) => {
    const barrierContainer = this.add.container(window.innerWidth / 2, 10, []);
    barrierContainer.setSize(
      gameOptions.vocabContainerWidth * gameOptions.barrierLength,
      gameOptions.vocabContainerWidth,
    );
    for (let i = 0; i < gameOptions.barrierLength; i++) {
      const vocabContainer = new VocabContainer(
        this,
        -(barrierContainer.width / 2) +
          gameOptions.vocabContainerWidth / 2 +
          gameOptions.vocabContainerWidth * i,
        0,
        gameOptions.vocabContainerWidth,
        `${hsk4vocab[vocabRoll[i].vocabId].hanzi} \n ${
          hsk4vocab[vocabRoll[i].vocabId].pinyin
        }`,
      );
      this.physics.world.enable(vocabContainer);
      if (vocabRoll[i].correct) {
        this.addHeroCollision(vocabContainer, this.correctVocabCollision);
      } else {
        this.addHeroCollision(vocabContainer, this.wrongVocabCollision);
      }

      barrierContainer.add(vocabContainer);
    }
    this.moveTowardsHero(barrierContainer, gameOptions.barrierStartSpeed);
    this.children.bringToTop(this.hero);
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
    this.correctVocabEmitter.explode(50, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    const firsttInQueue = this.vocabQueue.shift();
    this.physics.world.colliders
      .getActive()
      .reverse()
      .splice(gameOptions.barrierLength);
    this.hero.setText(hsk4vocab[firsttInQueue].translations[0]);
  };

  wrongVocabCollision = (
    hero: Phaser.GameObjects.GameObject,
    vocabContainer: Phaser.GameObjects.GameObject,
  ) => {
    this.wrongVocabEmitter.explode(30, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    const firsttInQueue = this.vocabQueue.shift();
    this.physics.world.colliders
      .getActive()
      .reverse()
      .splice(gameOptions.barrierLength);
    this.hero.setText(hsk4vocab[firsttInQueue].translations[0]);
    this.heartBar.loseHeart();
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
    this.load.spritesheet('blooddrop', 'assets/img/blooddrop.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('goldring', 'assets/img/goldring.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image('vocab', 'assets/img/platform.png');
    this.load.image('heart', 'assets/img/heart.png');
  }

  public create() {
    this.heartBar = new HeartBar(this, 0, 0, gameOptions.heartWidth);
    this.goldrings = this.add.particles('goldring');
    this.correctVocabEmitter = this.goldrings.createEmitter({
      frame: 0,
      x: 400,
      y: 300,
      speed: 200,
      frequency: 100,
      lifespan: 600,
      gravityY: 10,
    });
    this.blooddrops = this.add.particles('blooddrop');
    this.wrongVocabEmitter = this.blooddrops.createEmitter({
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
      '',
      heroStyle,
    ) as any;
    this.hero.setOrigin(0.5);
    this.physics.add.existing(this.hero);
    this.hero.body.setImmovable(true);
    const barrierTimer = this.time.addEvent({
      delay: gameOptions.barrierTimerDelay,
      callback: this.prepareBarrier,
      loop: true,
    });
  }

  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    if (cursorKeys.right.isDown) {
      this.hero.body.setVelocityX(500);
      this.heartBar.loseHeart();
    } else if (cursorKeys.left.isDown) {
      this.hero.body.setVelocityX(-500);
    } else {
      this.hero.body.setVelocityX(0);
    }
  }
}

export default GameScene;
