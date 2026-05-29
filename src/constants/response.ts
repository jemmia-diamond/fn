export const RESPONSE_INVALID_TOKEN = {
  code: 1,
  msg: "invalid token",
  data: {}
};

export const responseSuccess = (result: any, msg = "Success") => ({
  code: 0,
  msg,
  data: result
});

export const responseError = (error: Error) => ({
  code: 2,
  msg: error.message
});
