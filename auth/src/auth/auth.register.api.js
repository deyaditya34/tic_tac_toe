const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");
const userResolver = require("../middlewares/user-resolver");
const checkAdminRights = require("../middlewares/check-admin-rights");
const {validateUsername} = require("./auth.utils");

async function controller(req, res) {
  console.log("inside register function")
  const { username, password } = req.body;
  
  await authService.register(username, password);

  res.json({
    success: true,
    data: "user registered successfully",
  });
}

const missingParamsValidator = paramsValidator.createParamValidator(
  ["username", "password"],
  paramsValidator.PARAM_KEY.BODY
);

module.exports = buildApiHandler([
  missingParamsValidator,
  validateUsername,
  controller
]);
