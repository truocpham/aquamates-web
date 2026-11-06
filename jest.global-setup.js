// Runs before workers spawn, so every test file sees a non-UTC device timezone.
module.exports = async () => {
  process.env.TZ = 'Asia/Bangkok';
};
