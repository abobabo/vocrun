import * as csv2json from 'csvtojson';
import { gameOptions } from '../config';

export const rollFromSet = set => {
  var rndm = Math.floor(Math.random() * set.length);
  return set[rndm];
};

export const rollWeighted = spec => {
  let i,
    sum = 0,
    r = Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
};

export const csv2vocab = async (filePath: string, fileEncoding: string) => {
  const records: object[] = [];
  await csv2json
    .default({ delimiter: ',' })
    .fromFile(filePath, fileEncoding)
    .subscribe(async (row: any) => {
      records.push(row);
    });
  return records;
};

export const calculateBarriersPerScreen = (
  barrierHeight: number,
  barrierDistance: number,
  displayHeight: number = gameOptions.height,
) => {
  return Math.floor(displayHeight / (barrierHeight + barrierDistance));
};

export const calculateVocabContainerHeight = (
  screenWidth: number = gameOptions.width,
  vocabContainersPerBarrier: number = gameOptions.vocabContainersPerBarrier,
) => {
  return screenWidth / vocabContainersPerBarrier;
};

export const calculateBarrierDistance = (
  containerHeight: number,
  distanceFactor: number = gameOptions.distanceFactor,
) => {
  return containerHeight * distanceFactor;
};
