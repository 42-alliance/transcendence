import request from "supertest";
import { test_users_routes } from "./users.ts";

const baseURL = "http://user:4000";

const wait = async () => {
	let retries = 30; // Essayer pendant 30s max (1 requête/s)
	while (retries > 0) {
	  console.log(`Waiting for user service... (${retries} retries left)`);
	  try {
		const res = await request(baseURL).get("/users");
		if (res.status === 200) {
		  console.log("User service is ready!");
		  return;
		}
	  } catch (error) {
		console.log("User service not ready yet...");
	  }
	  retries--;
	  await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	throw new Error("User service failed to start within the timeout period");
  };
  
// This will run before any tests and Jest will wait for it to complete
beforeAll(async () => {
	jest.setTimeout(30000);
	await wait();
});

describe("User API Endpoints", () => {
	test_users_routes(baseURL);
	
});