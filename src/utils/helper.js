const { version, validate, v4 } = require("uuid");

class Helper {
  validateUuid = (id) => {
    return validate(id);
  };

  uuidVersion = (id) => {
    return version(id);
  };

  generateUuid = () => {
    return v4();
  };
}

module.exports = () => new Helper();
