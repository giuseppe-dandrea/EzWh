class EzWhException {
  static TableAlreadyExists = "ERROR: Table already exists";
  static InternalError = "ERROR: Internal server error";
	static NotFound = "ERROR: Not Found";
	static Unauthorized = "ERROR: User not authorized";
}

module.exports = EzWhException;
