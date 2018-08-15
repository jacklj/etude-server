export const convertArrayIntoObjectIndexedByIds = (array, idKey) => {
  const obj = {};
  array.forEach(item => {
    const id = item[idKey];
    obj[id] = item;
  });
  return obj;
};
