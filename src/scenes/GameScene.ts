import * as Phaser from 'phaser';
import {
  VocabRoll,
  BarrierType,
  BarrierTypes,
  ContainerType,
  TurnRoll,
} from '../classes';
import VocabContainer from '../classes/VocabContainer';
import HeartBar from '../classes/HeartBar';
import Score from '../classes/Score';
import Hero from '../classes/Hero';
import { gameOptions } from '../config';
import { rollFromSet, rollWeighted } from '../helpers';
import hsk4vocab from '../../assets/vocab/hsk4.json';
import { v4 as uuidv4 } from 'uuid';

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
  resolution: 3,
};

const barrierTypeWeights = {
  vanilla: 0.4,
  allwrong: 0.3,
  joker: 0.3,
};

const emitterConf = {
  frame: 0,
  x: 400,
  y: 300,
  speed: 200,
  frequency: 100,
  lifespan: 600,
  gravityY: 10,
};

class GameScene extends Phaser.Scene {
  private hero: Hero;
  private blooddrops: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private goldrings: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private wrongVocabEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private correctVocabEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private turnQueue: TurnRoll[] = [];

  private heartBar: HeartBar;

  private score: Score;

  private currentCollider;

  private hud: Phaser.GameObjects.Graphics;

  constructor() {
    super(sceneConfig);
  }

  prepareBarrier = () => {
    const rolledVocabIds = this.rollVocabIds(gameOptions.barrierLength);
    const correctVocabIndex = Math.floor(
      Math.random() * gameOptions.barrierLength,
    );
    const colliderId = uuidv4();
    const vocabRoll = this.setCorrectVocab(
      rolledVocabIds,
      correctVocabIndex,
      colliderId,
    );
    const barrierType = BarrierTypes[rollWeighted(barrierTypeWeights)];
    const vocabRollWithSpecials = this.rollSpecialContainers(
      vocabRoll,
      barrierType,
      correctVocabIndex,
    );
    this.addBarrier(vocabRollWithSpecials, colliderId);
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
    colliderId,
  ): VocabRoll[] => {
    const vocabRollWithCorrectVocab = Object.assign({}, vocabRoll);
    vocabRollWithCorrectVocab[correctVocabIndex].correct = true;
    this.turnQueue.push({
      vocabId: vocabRollWithCorrectVocab[correctVocabIndex].vocabId,
      colliderId: colliderId,
    });
    if (!this.hero.vocabSourceText.text) {
      const firstInQueue = this.turnQueue.shift();
      this.hero.vocabSourceText.setText(
        hsk4vocab[firstInQueue.vocabId].translations[0],
      );
      this.currentCollider = firstInQueue.colliderId;
    }
    return vocabRollWithCorrectVocab;
  };

  rollSpecialContainers = (
    vocabRoll: VocabRoll[],
    barrierType: BarrierType,
    correctVocabIndex: number,
  ): VocabRoll[] => {
    const incorrectIndeces = [...Array(5).keys()].filter(
      x => x != correctVocabIndex,
    );
    const vocabRollWithSpecialContainers = Object.assign({}, vocabRoll);
    switch (barrierType) {
      case BarrierType.JOKER:
        vocabRollWithSpecialContainers[rollFromSet(incorrectIndeces)].type =
          ContainerType.JOKER;
        break;
      case BarrierType.ALL_WRONG:
        vocabRollWithSpecialContainers[
          Math.floor(Math.random() * (gameOptions.barrierLength - 1))
        ].type = ContainerType.ALL_WRONG;
        break;
    }
    return vocabRollWithSpecialContainers;
  };

  addBarrier = (vocabRoll: VocabRoll[], colliderId) => {
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
        this.pickContainerSprite(vocabRoll[i]),
      );
      this.physics.world.enable(vocabContainer);
      if (vocabRoll[i].correct || vocabRoll[i].type == ContainerType.JOKER) {
        this.addHeroCollision(
          vocabContainer,
          this.correctVocabCollision,
          colliderId,
        );
      } else {
        this.addHeroCollision(
          vocabContainer,
          this.wrongVocabCollision,
          colliderId,
        );
      }
      barrierContainer.add(vocabContainer);
    }
    this.moveTowardsHero(barrierContainer, gameOptions.barrierStartSpeed);
    this.depthSorting();
  };

  depthSorting = () => {
    this.children.bringToTop(this.hero);
    this.children.bringToTop(this.hud);
    this.children.bringToTop(this.score.getScoreText());
    this.heartBar.bringToTop();
  };

  pickContainerText = (vocabRoll: VocabRoll) => {
    switch (vocabRoll.type) {
      case ContainerType.VANILLA:
        return `${hsk4vocab[vocabRoll.vocabId].hanzi} \n ${
          hsk4vocab[vocabRoll.vocabId].pinyin
        }`;
      case ContainerType.JOKER:
        return 'JOKER';
      case ContainerType.ALL_WRONG:
        return 'ALL WRONG';
      default:
        return '';
    }
  };

  pickContainerSprite = (vocabRoll: VocabRoll) => {
    switch (vocabRoll.type) {
      case ContainerType.VANILLA:
        return 'vocab';
      case ContainerType.JOKER:
        return 'clown';
      case ContainerType.ALL_WRONG:
        return 'thunder';
      default:
        return '';
    }
  };

  addHeroCollision = (
    gameObject: Phaser.GameObjects.GameObject,
    explodeOnCollide: any,
    colliderName,
  ) => {
    const collider = this.physics.add.collider(
      this.hero,
      gameObject,
      explodeOnCollide,
      null,
      this,
    );
    collider.setName(colliderName);
  };

  correctVocabCollision = (
    hero: Phaser.GameObjects.GameObject,
    vocabContainer: Phaser.GameObjects.GameObject,
  ) => {
    this.correctVocabEmitter.explode(50, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    const firsttInQueue = this.turnQueue.shift();
    this.removeBarrierColliders();
    this.currentCollider = firsttInQueue.colliderId;
    this.hero.vocabSourceText.setText(
      hsk4vocab[firsttInQueue.vocabId].translations[0],
    );
    this.score.increase();
  };

  wrongVocabCollision = (
    hero: Phaser.GameObjects.GameObject,
    vocabContainer: Phaser.GameObjects.GameObject,
  ) => {
    this.wrongVocabEmitter.explode(30, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    const firsttInQueue = this.turnQueue.shift();
    this.removeBarrierColliders();
    this.currentCollider = firsttInQueue.colliderId;
    this.hero.vocabSourceText.setText(
      hsk4vocab[firsttInQueue.vocabId].translations[0],
    );
    if (!this.heartBar.loseHeart()) {
      this.scene.start('GameOver', { score: this.score.getScore() });
    }
  };

  removeBarrierColliders = () => {
    const colliders = this.physics.world.colliders.getActive();
    colliders.forEach(x => x.name === this.currentCollider && x.destroy());
  };

  moveTowardsHero = (
    gameObject: Phaser.GameObjects.GameObject,
    speed: number,
  ) => {
    this.physics.world.enable(gameObject);
    const body = gameObject.body as Phaser.Physics.Arcade.Body;
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
    this.load.image('thunder', 'assets/img/thunder.png');
    this.load.image('clown', 'assets/img/clown.png');
    this.load.image('spike', 'assets/img/spike.png');
  }

  public create() {
    this.hero = new Hero(
      this,
      window.innerWidth / 2,
      window.innerHeight - 50,
      gameOptions.heroWidth,
      gameOptions.heroHeight,
      '',
      'spike',
    );
    this.currentCollider = uuidv4();
    this.hud = this.add
      .graphics()
      .fillStyle(0x1111222, 1)
      .fillRect(0, 0, window.innerWidth, gameOptions.heartWidth);
    this.heartBar = new HeartBar(this, 0, 0, gameOptions.heartWidth);
    this.score = new Score(this, window.innerWidth - 20, 20);
    this.goldrings = this.add.particles('goldring');
    this.correctVocabEmitter = this.goldrings.createEmitter(emitterConf).stop();
    this.blooddrops = this.add.particles('blooddrop');
    this.wrongVocabEmitter = this.blooddrops.createEmitter(emitterConf).stop();
    this.physics.add.existing(this.hero);
    const barrierTimer = this.time.addEvent({
      delay: gameOptions.barrierTimerDelay,
      callback: this.prepareBarrier,
      loop: true,
    });
    const herobody = this.hero.body as Phaser.Physics.Arcade.Body;
    herobody.setCollideWorldBounds(true);
  }

  public update() {
    const herobody = this.hero.body as Phaser.Physics.Arcade.Body;
    const cursorKeys = this.input.keyboard.createCursorKeys();
    if (cursorKeys.right.isDown) {
      herobody.setVelocityX(500);
    } else if (cursorKeys.left.isDown) {
      herobody.setVelocityX(-500);
    } else {
      herobody.setVelocityX(0);
    }
  }
}

export default GameScene;
