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
