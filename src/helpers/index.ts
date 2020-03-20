export const rollFromSet = set => {
  var rndm = Math.floor(Math.random() * set.length);
  return set[rndm];
};

export const rollWeighted = weights => {
  let i,
    sum = 0,
    r = Math.random();
  for (i in weights) {
    sum += weights[i];
    if (r <= sum) return i;
  }
};
