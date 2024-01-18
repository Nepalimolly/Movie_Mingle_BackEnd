import { signup } from "../../controllers/auth.js";
import { db } from "../../connect.js";
import bcrypt from "bcryptjs";

jest.mock("../../connect.js", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  genSaltSync: jest.fn(() => "fakeSalt"),
  hashSync: jest.fn(() => "hashedPassword"),
}));

beforeEach(() => {
  db.query.mockClear();
  bcrypt.genSaltSync.mockClear();
  bcrypt.hashSync.mockClear();
});

const request = {
  body: {
    username: "fakeUsername",
    email: "fakeEmail@gmail.com",
    password: "fakePassword",
    name: "fakeName",
  },
};

const response = {
  status: jest.fn(function (status) {
    this.statusCode = status;
    return this;
  }),
  json: jest.fn(function (json) {
    this.body = json;
    return this;
  }),
};

it(`should return 400 status code when user exist already`, async () => {
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, [{}]); // Mock user already exists
  });

  await signup(request, response);

  expect(response.status).toHaveBeenCalledWith(409);
  expect(response.json).toHaveBeenCalledWith("Sorry, this user already exist");
});

it(`should return 200 status code when user is successfully created`, async () => {
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, []); // Mock user does not exist
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, {}); // Mock user creation success
  });

  await signup(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(
    "User has been successfully created"
  );
});
