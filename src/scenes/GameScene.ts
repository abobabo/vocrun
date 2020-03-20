import * as Phaser from 'phaser';
import {
  VocabRoll,
  BarrierType,
  BarrierTypes,
  ContainerType,
} from '../classes';
import VocabContainer from '../classes/VocabContainer';
import HeartBar from '../classes/HeartBar';
import Score from '../classes/Score';
import { gameOptions } from '../config';
import hsk4vocab from '../../assets/vocab/hsk4.json';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

const heroStyle = {
  font: '14px Arial',
  fill: 'black',
  wordWrap: true,
  align: 'center',
  backgroundColor: 'white',
};

const barrierTypeWeights = {
  vanilla: 0.4,
  allwrong: 0.3,
  joker: 0.3,
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

  private score: Score;

  constructor() {
    super(sceneConfig);
  }

  prepareBarrier = () => {
    const rolledVocabIds = this.rollVocabIds(gameOptions.barrierLength);
    const correctVocabIndex = Math.floor(
      Math.random() * gameOptions.barrierLength,
    );
    const vocabRoll = this.setCorrectVocab(rolledVocabIds, correctVocabIndex);
    const barrierType = BarrierTypes[this.rollWeighted(barrierTypeWeights)];
    const vocabRollWithSpecials = this.rollSpecialContainers(
      vocabRoll,
      barrierType,
      correctVocabIndex,
    );
    this.addBarrier(vocabRollWithSpecials, BarrierTypes[barrierType]);
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
        type: ContainerType.VANILLA,
      };
    });
    return vocabRoll;
  };

  setCorrectVocab = (
    vocabRoll: VocabRoll[],
    correctVocabIndex: number,
  ): VocabRoll[] => {
    const vocabRollWithCorrectVocab = Object.assign({}, vocabRoll);
    vocabRollWithCorrectVocab[correctVocabIndex].correct = true;
    this.vocabQueue.push(vocabRollWithCorrectVocab[correctVocabIndex].vocabId);
    if (!this.hero.text) {
      const currentInQueue = this.vocabQueue.shift();
      this.hero.setText(hsk4vocab[currentInQueue].translations[0]);
    }
    return vocabRollWithCorrectVocab;
  };

  rollFromSet = set => {
    var rndm = Math.floor(Math.random() * set.length);
    return set[rndm];
  };

  rollWeighted = weights => {
    let i,
      sum = 0,
      r = Math.random();
    for (i in weights) {
      sum += weights[i];
      if (r <= sum) return i;
    }
  };

  rollSpecialContainers = (
    vocabRoll: VocabRoll[],
    barrierType: BarrierType,
    correctVocabIndex: number,
  ): VocabRoll[] => {
    const remainingIndeces = [...Array(5).keys()].filter(
      x => x != correctVocabIndex,
    );
    const vocabRollWithSpecialContainers = Object.assign({}, vocabRoll);
    switch (barrierType) {
      case BarrierType.JOKER:
        vocabRollWithSpecialContainers[
          this.rollFromSet(remainingIndeces)
        ].type = ContainerType.JOKER;
        break;
      case BarrierType.ALL_WRONG:
        vocabRollWithSpecialContainers[
          Math.floor(Math.random() * (gameOptions.barrierLength - 1))
        ].type = ContainerType.ALL_WRONG;
        break;
      default:
    }
    return vocabRollWithSpecialContainers;
  };

  addBarrier = (vocabRoll: VocabRoll[], barrierType: BarrierType) => {
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
        this.pickContainerText(vocabRoll[i]),
        'vocab',
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

  pickContainerText = (vocabRoll: VocabRoll) => {
    switch (vocabRoll.type) {
      case ContainerType.VANILLA:
        return `${hsk4vocab[vocabRoll.vocabId].hanzi} \n ${
          hsk4vocab[vocabRoll.vocabId].pinyin
        }`;
      case ContainerType.JOKER:
        return 'JOKER';
      default:
        return '';
    }
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
    this.score.increase();
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
    if (!this.heartBar.loseHeart()) {
      this.scene.start('GameOver', { score: this.score.getScore() });
    }
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
    this.score = new Score(this, window.innerWidth - 20, 20);
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
    } else if (cursorKeys.left.isDown) {
      this.hero.body.setVelocityX(-500);
    } else {
      this.hero.body.setVelocityX(0);
    }
  }
}

export default GameScene;
