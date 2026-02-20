const { swaggerUi, specs } = require('../dist/config/swagger');

module.exports = async (req, res) => {
  // Handle Swagger UI requests
  swaggerUi.serve(req, res, () => {
    swaggerUi.setup(specs)(req, res);
  });
};
