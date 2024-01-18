import {
  getRelationships,
  addRelationship,
  deleteRelationship,
} from "../../controllers/relationship.js";
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
  query: {
    followedUserId: "fakeFollowedUserId",
    userId: "fakeUserId",
  },
  body: {
    userId: "fakeUserId",
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

it("should return relationships", async () => {
  const fakeRelationships = [{ followerUserId: "fakeFollowerUserId" }];
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, fakeRelationships);
  });

  await getRelationships(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(
    fakeRelationships.map((relationship) => relationship.followerUserId)
  );
});

it("should add a relationship", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { insertId: 1 });
  });

  await addRelationship(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith("Following");
});

it("should delete a relationship", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { affectedRows: 1 });
  });

  await deleteRelationship(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith("Unfollow");
});
