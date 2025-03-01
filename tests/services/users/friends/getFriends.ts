import request from "supertest";
import { generateRandomString } from "../../utils/utils.ts";
import { User } from "../../utils/types.ts";

let users: User[] = [];
const USERS = 4; // Créez 3 utilisateurs pour tester les relations d'amitié

export function getFriends_tests(baseURL: string) {
  // Créez des utilisateurs pour les tests
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

    // Créez des relations d'amitié entre les utilisateurs
    await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", users[0].id.toString())
      .send({ friendName: users[1].name })
      .expect(201);

    await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", users[1].id.toString())
      .send({ friendName: users[2].name })
      .expect(201);

    // Acceptez les demandes d'amitié
    await request(baseURL)
      .post(`/friends/requests/${users[1].id}/status`)
      .set("x-user-id", users[0].id.toString())
      .send({ status: "accepted" })
      .expect(200);

    await request(baseURL)
      .post(`/friends/requests/${users[2].id}/status`)
      .set("x-user-id", users[1].id.toString())
      .send({ status: "accepted" })
      .expect(200);
  });

  // Supprimez les utilisateurs après les tests
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

  test("GET /friends/list - Should return the list of accepted friends", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .get("/friends/list")
      .set("x-user-id", userId.toString())
      .expect(200);

    // Vérifiez que la réponse contient la liste des amis
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1); // users[0] a un ami (users[1])

    // Vérifiez que l'ami est correctement formaté
    const friend = res.body[0];
    expect(friend).toHaveProperty("id");
    expect(friend).toHaveProperty("name");
    expect(friend).toHaveProperty("picture");
    expect(friend.id).toBe(users[1].id);
    expect(friend.name).toBe(users[1].name);
    expect(friend.picture).toBe(users[1].picture);
  });

  test("GET /friends/list - Should return an empty list if the user has no friends", async () => {
    const userId = users[3].id;

    const res = await request(baseURL)
      .get("/friends/list")
      .set("x-user-id", userId.toString())
      .expect(200);

    // Vérifiez que la réponse est une liste vide
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  test("GET /friends/list - Should return an error if the user ID is missing", async () => {
    const res = await request(baseURL)
      .get("/friends/list")
      .expect(400);

    expect(res.body.message).toBe("headers must have required property 'x-user-id'");
  });

  test("GET /friends/list - Should return an error if the user ID is invalid", async () => {
    const res = await request(baseURL)
      .get("/friends/list")
      .set("x-user-id", "invalid_id")
      .expect(400);

    expect(res.body.message).toBe("headers/x-user-id must match pattern \"^[0-9]+$\"");
  });
}