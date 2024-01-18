import { getComments, addComment } from "../../controllers/comment.js";
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
    postId: "fakePostId",
  },
  body: {
    desc: "fakeDesc",
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

it("should return comments for a post", async () => {
  const fakeComments = [{ id: 1, desc: "fakeDesc" }];
  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, fakeComments);
  });

  await getComments(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(fakeComments);
});

it("should add a comment to a post", async () => {
  jwt.verify.mockImplementationOnce((token, secret, callback) => {
    callback(null, { id: "fakeUserId" });
  });

  db.query.mockImplementationOnce((sql, values, callback) => {
    callback(null, { insertId: 1 });
  });

  await addComment(request, response);

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith(
    "comment has been succesfully created"
  );
});
