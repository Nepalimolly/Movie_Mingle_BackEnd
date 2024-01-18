import { getLikes, addLike, deleteLike } from "../../controllers/like.js";
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
    postId: "fakePostId",
  },
  body: {
    postId: "fakePostId",
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

it("should return likes for a post", async () => {
  const fakeLikes = [{ userId: "fakeUserId" }];
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, fakeLikes);
  });

  await getLikes(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(
    fakeLikes.map((like) => like.userId)
  );
});

it("should add a like to a post", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { insertId: 1 });
  });

  await addLike(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith("Post has been liked");
});

it("should delete a like from a post", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { affectedRows: 1 });
  });

  await deleteLike(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith("like has been removed");
});
