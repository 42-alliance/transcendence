import request from "supertest";
import { generateRandomString } from "../../utils/utils.ts";
import { User } from "../../utils/types.ts";

let users: User[] = [];
const USERS = 2;

export function addFriend_tests(baseURL: string) {
  // Créez les utilisateurs avant tous les tests
  beforeAll(async () => {
    for (let i = 0; i < USERS; i++) {
      users[i] = { name: generateRandomString(10), picture: generateRandomString(10), id: 0 };
      const res = await request(baseURL)
        .post("/users")
        .send({ name: users[i].name, picture: users[i].picture });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      users[i].id = res.body.id;
    }
  });

  // Supprimez les utilisateurs après tous les tests
  afterAll(async () => {
    for (let i = 0; i < USERS; i++) {
      const userId = users[i].id;
      const res = await request(baseURL)
        .delete("/users")
        .set("x-user-id", userId.toString());
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "User successfully deleted" });
    }
  });

  // Les tests restent inchangés
  test("POST /friends/requests - Add a friend", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", userId.toString())
      .send({ friendName: users[1].name })
      .expect(201);
    expect(res.body.message).toBe(`Friend request sent to ${users[1].name}`);
  });

  test("POST /friends/requests - Should return an error because friend request already exists", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", userId.toString())
      .send({ friendName: users[1].name })
      .expect(400);
    expect(res.body.message).toBe("Friend request already exists");
  });

  test("POST /friends/requests - Should return an error if the friend does not exist", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", userId.toString())
      .send({ friendName: "non_existent_user" })
      .expect(404);

    expect(res.body.message).toBe("This friend don't exist");
  });

  test("POST /friends/requests - Should return an error if body is not a object", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", userId.toString())
      .expect(400);

    expect(res.body.message).toBe("body must be object");
  });

  test("POST /friends/requests - Should return an error if the friendName is not set", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", userId.toString())
      .send({})
      .expect(400);

    expect(res.body.message).toBe("body must have required property 'friendName'");
  });

  test("POST /friends/requests - Should return an error if the user tries to add themselves as a friend", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", userId.toString())
      .send({ friendName: users[0].name })
      .expect(400);
    expect(res.body.message).toBe("You cannot add yourself as a friend");
  });
}