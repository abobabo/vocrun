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
import {
  rollFromSet,
  rollWeighted,
  calculateVocabContainerHeight,
  calculateBarrierDistance,
  calculateBarriersPerScreen,
  calculateRandomExtraDistance,
} from '../helpers';
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

  private wrongVocabParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private wrongVocabEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private correctVocabParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private correctVocabEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private jokerParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  private jokerEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private turnQueue: TurnRoll[];

  private heartBar: HeartBar;

  private score: Score;

  private currentCollider;

  private hud: Phaser.GameObjects.Graphics;

  private vocabContainerWidth: number;

  private barrierDistance: number;

  private barriersPerScreen: number;

  private barrierSpeed: number;

  private barrierGroup = new Phaser.GameObjects.Group(this);

  private vocabulary;

  constructor() {
    super(sceneConfig);
  }

  prepareBarrier = (barrierY: number = -this.vocabContainerWidth) => {
    const rolledVocabIds = this.rollVocabIds(
      gameOptions.vocabContainersPerBarrier,
    );
    const correctVocabIndex = Math.floor(
      Math.random() * gameOptions.vocabContainersPerBarrier,
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
    this.addBarrier(vocabRollWithSpecials, colliderId, barrierY);
  };

  rollVocabIds = (vocabAmount: number): VocabRoll[] => {
    const vocabIdRoll: any[] = [];
    while (vocabIdRoll.length < vocabAmount) {
      const roll = Math.floor(Math.random() * this.vocabulary.length);
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
  ) => {
    const vocabRollWithCorrectVocab = Object.assign({}, vocabRoll);
    vocabRollWithCorrectVocab[correctVocabIndex].correct = true;
    this.turnQueue.push({
      vocabId: vocabRollWithCorrectVocab[correctVocabIndex].vocabId,
      colliderId: colliderId,
    });
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
          Math.floor(
            Math.random() * (gameOptions.vocabContainersPerBarrier - 1),
          )
        ].type = ContainerType.ALL_WRONG;
        break;
    }
    return vocabRollWithSpecialContainers;
  };

  addBarrier = (vocabRoll: VocabRoll[], colliderId, barrierY: number) => {
    const barrierContainer = this.add.container(
      gameOptions.width / 2,
      barrierY + calculateRandomExtraDistance(this.barrierDistance),
      [],
    );
    barrierContainer.setSize(
      this.vocabContainerWidth * gameOptions.vocabContainersPerBarrier,
      this.vocabContainerWidth,
    );
    for (let i = 0; i < gameOptions.vocabContainersPerBarrier; i++) {
      const vocabContainer = new VocabContainer(
        this,
        -(barrierContainer.width / 2) +
          this.vocabContainerWidth / 2 +
          this.vocabContainerWidth * i,
        0,
        this.vocabContainerWidth,
        this.pickContainerText(vocabRoll[i]),
        this.pickContainerSprite(vocabRoll[i]),
      );
      this.physics.world.enable(vocabContainer);
      if (vocabRoll[i].correct) {
        this.addHeroCollision(
          vocabContainer,
          this.correctVocabCollision,
          colliderId,
        );
      } else if (vocabRoll[i].type == ContainerType.JOKER) {
        this.addHeroCollision(vocabContainer, this.jokerCollision, colliderId);
      } else {
        this.addHeroCollision(
          vocabContainer,
          this.wrongVocabCollision,
          colliderId,
        );
      }
      barrierContainer.add(vocabContainer);
    }
    this.barrierGroup.add(barrierContainer);
    this.moveTowardsHero(barrierContainer, this.barrierSpeed);
    this.depthSorting();
  };

  resetBarrierSpeed = () => {
    this.barrierSpeed = gameOptions.barrierStartSpeed;
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
        return `${this.vocabulary[vocabRoll.vocabId].source1}`;
      case ContainerType.JOKER:
        return 'JOKER';
      case ContainerType.ALL_WRONG:
        return `ALL \n WRONG`;
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
    this.switchToNextBarrier();
    this.score.increase();
  };

  setHeroText = () => {
    const firstInQueue = this.turnQueue.shift();
    this.hero.vocabSourceText.setText(
      this.vocabulary[firstInQueue.vocabId].translation,
    );
    this.currentCollider = firstInQueue.colliderId;
  };

  wrongVocabCollision = (
    hero: Phaser.GameObjects.GameObject,
    vocabContainer: Phaser.GameObjects.GameObject,
  ) => {
    this.wrongVocabEmitter.explode(30, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    this.switchToNextBarrier();
    if (!this.heartBar.loseHeart()) {
      this.scene.start('GameOver', { score: this.score.getScore() });
    }
  };

  switchToNextBarrier = () => {
    this.removeBarrierColliders();
    this.prepareBarrier();
    this.destroyOldBarrier();
    this.setHeroText();
  };

  jokerCollision = (
    hero: Phaser.GameObjects.GameObject,
    vocabContainer: Phaser.GameObjects.GameObject,
  ) => {
    this.jokerEmitter.explode(30, this.hero.x, this.hero.y);
    vocabContainer.destroy();
    this.switchToNextBarrier();
    this.speedUpBarriers();
  };

  speedUpBarriers = () => {
    this.barrierSpeed = this.barrierSpeed * 1.5;
    this.barrierGroup.getChildren().forEach(x => {
      const body = x.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(this.barrierSpeed);
    });
    const timer = this.time.delayedCall(5000, this.resetBarrierSpeed);
  };

  destroyOldBarrier = () => {
    if (this.barrierGroup.getChildren().length > this.barriersPerScreen + 3) {
      const oldBarrier = this.barrierGroup.getChildren().shift();
      oldBarrier.destroy();
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
    this.load.spritesheet(
      'correctvocabemit',
      'assets/img/correctvocabemit.png',
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.spritesheet('allwrongemit', 'assets/img/allwrongemit.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet('jokeremit', 'assets/img/jokeremit.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.image('vocab', 'assets/img/platform.png');
    this.load.image('heart', 'assets/img/heart.png');
    this.load.image('thunder', 'assets/img/thunder.png');
    this.load.image('clown', 'assets/img/clown.png');
    this.load.image('spike', 'assets/img/spike.png');
  }

  init(data) {
    this.vocabulary = data.vocabulary;
  }

  addInitialBarriers = () => {
    for (let i = 0; i < this.barriersPerScreen; i++) {
      let position = this.vocabContainerWidth / 2 + i * this.barrierDistance;
      this.prepareBarrier(
        -(
          this.vocabContainerWidth / 2 +
          i * (this.barrierDistance + this.vocabContainerWidth)
        ),
      );
    }
  };
  public create() {
    this.turnQueue = [];
    this.barrierSpeed = gameOptions.barrierStartSpeed;
    this.vocabContainerWidth = calculateVocabContainerHeight();
    this.barrierDistance = calculateBarrierDistance(this.vocabContainerWidth);
    this.barriersPerScreen = calculateBarriersPerScreen(
      this.vocabContainerWidth,
      this.barrierDistance,
    );
    this.hero = new Hero(
      this,
      gameOptions.width / 2,
      window.innerHeight - 100,
      gameOptions.heroWidth,
      gameOptions.heroHeight,
      '',
      'spike',
    );
    this.currentCollider = uuidv4();
    this.hud = this.add
      .graphics()
      .fillStyle(0x1111222, 1)
      .fillRect(0, 0, gameOptions.width, gameOptions.heartWidth);
    this.heartBar = new HeartBar(this, 0, 0, gameOptions.heartWidth);
    this.score = new Score(this, gameOptions.width, gameOptions.heartWidth);

    this.correctVocabParticles = this.add.particles('correctvocabemit');
    this.correctVocabEmitter = this.correctVocabParticles
      .createEmitter(emitterConf)
      .stop();

    this.wrongVocabParticles = this.add.particles('blooddrop');
    this.wrongVocabEmitter = this.wrongVocabParticles
      .createEmitter(emitterConf)
      .stop();

    this.jokerParticles = this.add.particles('jokeremit');
    this.jokerEmitter = this.jokerParticles.createEmitter(emitterConf).stop();

    this.physics.add.existing(this.hero);
    const herobody = this.hero.body as Phaser.Physics.Arcade.Body;
    herobody.setCollideWorldBounds(true);
    this.addInitialBarriers();
    this.setHeroText();
    const pointer = this.input.addPointer();
  }

  public update() {
    const herobody = this.hero.body as Phaser.Physics.Arcade.Body;
    const cursorKeys = this.input.keyboard.createCursorKeys();
    if (this.input.pointer1.isDown) {
      this.hero.setX(this.input.pointer1.x);
    }
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
