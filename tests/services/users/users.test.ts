import request from "supertest";

const baseURL = "http://user:4000";
let userId: number;

const wait = async () => {
	while (true) {
	  console.log("Waiting for user service to start...");
	  try {
		const res = await request(baseURL).get("/users");
		if (res.status === 200) {
		  console.log("User service is up!");
		  break;
		}
	  } catch (error) {
		console.log("User service not ready yet...");
	  }
	  await new Promise((resolve) => setTimeout(resolve, 1000));
	}
  };
  
// This will run before any tests and Jest will wait for it to complete
beforeAll(async () => {
  await wait();
});

describe("User API Endpoints", () => {
  test("POST /users - Should create a new user", async () => {
    const res = await request(baseURL)
      .post("/users")
      .send({ name: "JohnDoe", picture: "avatar.jpg" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    userId = res.body.id;
  });
  
  test("GET /users - Should return all users", async () => {
    const res = await request(baseURL).get("/users");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
	test("DELETE /users - Should delete a user", async () => {
		const res = await request(baseURL)
			.delete("/users")
			.set("x-user-id", userId.toString());
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ message: "User successfully deleted" });
	});
});