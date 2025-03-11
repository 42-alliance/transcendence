import request from "supertest";
import { generateRandomString } from "../../utils/utils.ts";
import { User } from "../../utils/types.ts";

let users: User[] = [];
const USERS = 2;

export function updateFriendStatus_tests(baseURL: string) {
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

    // Créez une relation d'amitié entre les utilisateurs
    const res = await request(baseURL)
      .post("/friends/requests")
      .set("x-user-id", users[0].id.toString())
      .send({ friendName: users[1].name })
      .expect(201);
    expect(res.body.message).toBe(`Friend request sent to ${users[1].name}`);
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

  test("POST /friends/requests/:friendId/status - Should update the friend request status", async () => {
    const userId = users[0].id;
    const friendId = users[1].id;

    const res = await request(baseURL)
      .post(`/friends/requests/${friendId}/status`)
      .set("x-user-id", userId.toString())
      .send({ status: "accepted" })
      .expect(200);

    expect(res.body.message).toBe("Friend request is now accepted");
  });

  test("POST /friends/requests/:friendId/status - Should return an error if the status is invalid", async () => {
    const userId = users[0].id;
    const friendId = users[1].id;

    const res = await request(baseURL)
      .post(`/friends/requests/${friendId}/status`)
      .set("x-user-id", userId.toString())
      .send({ status: "invalid_status" })
      .expect(400);

    expect(res.body.error).toBe("Error: invalid status");
  });

  test("POST /friends/requests/:friendId/status - Should return an error if the friend relation does not exist", async () => {
    const userId = users[0].id;
    const nonExistentFriendId = 9999; // ID qui n'existe pas

    const res = await request(baseURL)
      .post(`/friends/requests/${nonExistentFriendId}/status`)
      .set("x-user-id", userId.toString())
      .send({ status: "accepted" })
      .expect(404);

    expect(res.body.message).toBe("Friendship relation not found");
  });

  test("POST /friends/requests/:friendId/status - Should return an error if the friend ID is invalid", async () => {
    const userId = users[0].id;

    const res = await request(baseURL)
      .post("/friends/requests/invalid_id/status")
      .set("x-user-id", userId.toString())
      .send({ status: "accepted" })
      .expect(400);

    expect(res.body.message).toBe("params/friendId must match pattern \"^[0-9]+$\"");
  });

  test("POST /friends/requests/:friendId/status - Should return an error if the status is missing", async () => {
    const userId = users[0].id;
    const friendId = users[1].id;

    const res = await request(baseURL)
      .post(`/friends/requests/${friendId}/status`)
      .set("x-user-id", userId.toString())
	  .send({})
      .expect(400);
	  
	  expect(res.body.message).toBe("body must have required property 'status'");
	});
	
	test("POST /friends/requests/:friendId/status - Should return an error if the status is missing", async () => {
		const userId = users[0].id;
		const friendId = users[1].id;
		
		const res = await request(baseURL)
		.post(`/friends/requests/${friendId}/status`)
		.set("x-user-id", userId.toString())
      .expect(400);

    expect(res.body.message).toBe("body must be object");
  });
}