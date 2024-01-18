import { getUser, updateUser } from "../../controllers/user.js";
import { db } from "../../connect.js";
import jwt from "jsonwebtoken";

jest.mock("../../connect.js", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

beforeEach(() => {
  db.query.mockClear();
  jwt.verify.mockClear();
});

const request = {
  params: {
    userId: "fakeUserId",
  },
  body: {
    name: "fakeName",
    city: "fakeCity",
    website: "fakeWebsite",
    coverPic: "fakeCoverPic",
    profilePic: "fakeProfilePic",
  },
  cookies: {
    accessToken: "fakeToken",
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

it("should return user", async () => {
  const fakeUser = {
    id: "fakeUserId",
    password: "fakePassword",
    name: "fakeName",
  };
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, [fakeUser]);
  });

  await getUser(request, response);

  const { password, ...info } = fakeUser;
  expect(response.json).toHaveBeenCalledWith(info);
});

it("should update user", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { affectedRows: 1 });
  });

  await updateUser(request, response);

  expect(response.json).toHaveBeenCalledWith("Updated user");
});
