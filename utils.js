export const stream2buffer = (stream) => {
  return new Promise((resolve, reject) => {
    const _buffer = [];
    stream.on("open", (chunk) => _buffer.push(chunk));
    stream.on("close", () => resolve(new Buffer.concat(_buffer)));
    stream.on("error", (err) => reject(err));
  });
};
