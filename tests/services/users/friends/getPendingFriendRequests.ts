import request from "supertest";
import { generateRandomString } from "../../utils/utils.ts";
import { User } from "../../utils/types.ts";

let users: User[] = [];
const USERS = 3; // Créez 3 utilisateurs pour tester les demandes d'amitié en attente

export function getPendingFriendRequest_tests(baseURL: string) {
  // Créez des utilisateurs pour les tests
  beforeAll(async () => {
    for (let i = 0; i < USERS; i++) {
      users[i] = { name: generateRandomString(10), picture: generateRandomString(10), id: 0 };
      const res = await request(baseURL)
        .post("/users")
        .send({ name: users[i].name, picture: users[i].picture });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      users[i].id = res.body.id;
    }

    // Créez des demandes d'amitié en attente
    await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", users[0].id.toString())
      .send({ friendName: users[1].name })
      .expect(201);

    await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", users[2].id.toString())
      .send({ friendName: users[1].name })
      .expect(201);
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

  test("GET /friends/requests/pending - Should return the list of pending friend requests", async () => {
    const userId = users[1].id; // users[1] a deux demandes en attente (de users[0] et users[2])

    const res = await request(baseURL)
      .get("/friends/requests/pending")
      .set("x-user-id", userId.toString())
      .expect(200);

    // Vérifiez que la réponse contient la liste des demandes en attente
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2); // users[1] a deux demandes en attente

    // Vérifiez que les demandes sont correctement formatées
    const requestSenders = res.body;
    requestSenders.forEach((sender: any) => {
      expect(sender).toHaveProperty("id");
      expect(sender).toHaveProperty("name");
      expect(sender).toHaveProperty("picture");
    });

    // Vérifiez que les demandes proviennent des bons utilisateurs
    const senderIds = requestSenders.map((sender: any) => sender.id);
    expect(senderIds).toContain(users[0].id);
    expect(senderIds).toContain(users[2].id);
  });

  test("GET /friends/requests/pending - Should return an empty list if there are no pending requests", async () => {
    const userId = users[0].id; // users[0] n'a pas de demandes en attente

    const res = await request(baseURL)
      .get("/friends/requests/pending")
      .set("x-user-id", userId.toString())
      .expect(200);

    // Vérifiez que la réponse est une liste vide
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  test("GET /friends/requests/pending - Should return an error if the user ID is missing", async () => {
    const res = await request(baseURL)
      .get("/friends/requests/pending")
      .expect(400);

    expect(res.body.message).toBe("headers must have required property 'x-user-id'");
  });

  test("GET /friends/requests/pending - Should return an error if the user ID is invalid", async () => {
    const res = await request(baseURL)
      .get("/friends/requests/pending")
      .set("x-user-id", "invalid_id")
      .expect(400);

    expect(res.body.message).toBe("headers/x-user-id must match pattern \"^[0-9]+$\"");
  });
}