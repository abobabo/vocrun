import * as csv2json from 'csvtojson';
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
