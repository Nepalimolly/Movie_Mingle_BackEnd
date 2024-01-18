import { login } from "../../controllers/auth.js";
import { db } from "../../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../../connect.js", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compareSync: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

beforeEach(() => {
  db.query.mockClear();
  bcrypt.compareSync.mockClear();
  jwt.sign.mockClear();
});

const request = {
  body: {
    username: "fakeUsername",
    password: "fakePassword",
  },
};

const response = {
  cookie: jest.fn(function (name, value, options) {
    this.cookies = { [name]: value };
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
};

it(`should return 404 status code when user is not found`, async () => {
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, []); // Mock user not found
  });

  await login(request, response);

  expect(response.status).toHaveBeenCalledWith(404);
  expect(response.json).toHaveBeenCalledWith("Sorry, User not found");
});

it(`should return 400 status code when password is incorrect`, async () => {
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, [{ password: "hashedPassword" }]); // Mock user found
  });

  bcrypt.compareSync.mockReturnValueOnce(false); // Mock password incorrect

  await login(request, response);

  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledWith(
    "You have entered the wrong password/username"
  );
});

it(`should return 200 status code and set cookie when login is successful`, async () => {
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, [
      { id: 1, password: "hashedPassword", username: "fakeUsername" },
    ]); // Mock user found
  });

  bcrypt.compareSync.mockReturnValueOnce(true); // Mock password correct
  jwt.sign.mockReturnValueOnce("fakeToken"); // Mock JWT token

  await login(request, response);

  expect(response.cookie).toHaveBeenCalledWith("accessToken", "fakeToken", {
    httpOnly: true,
  });
  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith({
    id: 1,
    username: "fakeUsername",
  });
});
