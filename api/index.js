const app = require('../dist/app');

module.exports = async (req, res) => {
  try {
    // Handle all requests with the Express app
    await app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: {
        code: '500',
        message: 'A server error has occurred'
      }
    });
  }
};
