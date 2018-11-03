
console.log('--------------------  api  ----------------------');
Object.getOwnPropertyNames(api).forEach(
  function (val, idx, array) {
    console.log(val);
  }
);

console.log('-------------------  ctx  -----------------------');
Object.getOwnPropertyNames(ctx).forEach(
  function (val, idx, array) {
    console.log(val);
  }
);

console.log('--------------------  console  -------------------');
Object.getOwnPropertyNames(console).forEach(
  function (val, idx, array) {
    console.log(val);
  }
);

console.log('----------------------  http  -------------------');
Object.getOwnPropertyNames(http).forEach(
  function (val, idx, array) {
    console.log(val);
  }
);

