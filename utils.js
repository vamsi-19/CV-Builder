export const stream2buffer = (stream) => {
  return new Promise((resolve, reject) => {
    const _buffer = [];
    stream.on("open", (chunk) => _buffer.push(chunk));
    stream.on("close", () => resolve(new Buffer.concat(_buffer)));
    stream.on("error", (err) => reject(err));
  });
};

export const stringValidator = (str) => {
  if(typeof str === 'string' && str.length > 0) return true;
  return false;
}

export const arrayValidator = (arr) => {
  if(typeof arr === 'object' && arr.length > 0) return true;
  return false;
}

export const objectValidator = (obj) => {
  if(typeof obj === 'object') return true;
  return false;
}
