import { getPosts, addPost, deletePost } from "../../controllers/post.js";
import { db } from "../../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

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
    userId: "fakeUserId",
  },
  body: {
    desc: "fakeDesc",
    img: "fakeImg",
  },
  cookies: {
    accessToken: "fakeToken",
  },
  params: {
    id: "fakePostId",
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

it("should return posts", async () => {
  const fakePosts = [{ id: 1, desc: "fakeDesc", img: "fakeImg" }];

  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, fakePosts);
  });

  await getPosts(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(fakePosts);
});

it("should add a post", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { insertId: 1 });
  });

  await addPost(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith("Post has been created.");
});

it("should delete a post", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { affectedRows: 1 });
  });

  await deletePost(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith("Post has been deleted.");
});
