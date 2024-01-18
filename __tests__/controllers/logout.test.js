import { logout } from "../../controllers/auth.js";

const response = {
  clearCookie: jest.fn(function (name, options) {
    delete this.cookies[name];
    return this;
  }),
  status: jest.fn(function (status) {
    this.statusCode = status;
    return this;
  }),
  json: jest.fn(function (json) {
    this.body = json;
    return this;
  }),
  cookies: {
    accessToken: "existingToken",
  },
};

beforeEach(() => {
  response.clearCookie.mockClear();
  response.status.mockClear();
  response.json.mockClear();
});

it("should clear the accessToken cookie and return a success message", async () => {
  await logout({}, response);

  expect(response.clearCookie).toHaveBeenCalledWith("accessToken", {
    secure: true,
    sameSite: "none",
  });
  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(
    "User has been succesfully logged out!"
  );
});
