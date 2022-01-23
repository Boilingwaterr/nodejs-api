module.exports = (api) => {
  const isTest = api.env('test');
  if (isTest) {
    return {
      plugins: [
        'module-resolver',
        {
          alias: {
            '@src/': 'src/',
            '@routes/': 'src/routes/',
            '@models/': 'src/models/',
            '@utils/': 'src/utils/',
            '@controllers/': 'src/controllers/',
            '@middlewares/': 'src/middlewares/'
          }
        }
      ]
    };
  }
};
