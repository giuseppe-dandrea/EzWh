class EzWhException {
  static TableAlreadyExists = "ERROR: Table already exists";
  static InternalError = "ERROR: Internal server error";
  static NotFound = "ERROR: Not Found";
  static PositionFull = "ERROR: Position cannot contain all the requested items";
}

module.exports = EzWhException;
