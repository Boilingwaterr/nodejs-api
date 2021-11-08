export const hasErrorMessage = (error: unknown): error is Error => {
  if ('message' in (error as object)) {
    return true;
  }
  return false;
};

export const throwDataBaseError = (error: unknown) => {
  if (hasErrorMessage(error)) {
    throw new Error(error.message);
  }
  throw new Error('An error occurred while accessing the Database.');
};
