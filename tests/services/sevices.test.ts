import request from "supertest";
import { test_users_routes } from "./users/users.ts";
import { addFriend_tests } from "./users/friends/add.friends.ts";
import { removeFriend_tests } from "./users/friends/remove.friend.ts";
import { getFriendStatus_tests } from "./users/friends/getFriendStatus.ts";
import { updateFriendStatus_tests } from "./users/friends/updateFriendStatus.ts";
import { getFriends_tests } from "./users/friends/getFriends.ts";
import { getPendingFriendRequest_tests } from "./users/friends/getPendingFriendRequests.ts";
import { websocket_chat_tests } from "./chat/connectWebsocket.ts";
import { createConversation_tests } from "./chat/createConversation.ts";
import { getAllConversations_tests } from "./chat/getAllConversations.ts";

const userURL = "http://user:4000";
const chatURL_WS = "ws://chat:5000";
const chatURL_HTTP = "http://chat:5000";

const waitUser = async () => {
	let retries = 100; // Essayer pendant 30s max (1 requête/s)
	while (retries > 0) {
	  console.log(`Waiting for user service... (${retries} retries left)`);
	  try {
		const res = await request(userURL).get("/users/healthcheck");
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

const waitChat = async () => {
	let retries = 100; // Essayer pendant 30s max (1 requête/s)
	while (retries > 0) {
	  console.log(`Waiting for chat service... (${retries} retries left)`);
	  try {
		const res = await request(chatURL_HTTP.replace("ws", "http")).get("/chat/healthcheck");
		if (res.status === 200) {
		  console.log("Chat service is ready!");
		  return;
		}
	  } catch (error) {
		console.log("Chat service not ready yet...");
	  }
	  retries--;
	  await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	throw new Error("Chat service failed to start within the timeout period");
};
  
// This will run before any tests and Jest will wait for it to complete
beforeAll(async () => {
	jest.setTimeout(30000);
	await waitUser();
	await waitChat();
});

describe("User API Endpoints", () => {
	test_users_routes(userURL);
	
});

describe("Friends API Endpoints", () => {
	describe("add Friend function", () => {
		addFriend_tests(userURL);
	});

	describe("remove Friend function", () => {
		removeFriend_tests(userURL);
	});
	
	describe("get Friend status function", () => {
		getFriendStatus_tests(userURL);
	});
	
	describe("update Friend status function", () => {
		updateFriendStatus_tests(userURL);
	});
	
	describe("get Friends function", () => {
		getFriends_tests(userURL);
	});

	describe("get pending Friends request function", () => {
		getPendingFriendRequest_tests(userURL);
	});
});

describe("Chat API Endpoints", () => {
	describe("create conversation tests", () => {
		createConversation_tests(userURL, chatURL_HTTP);
	});
	
	describe("get all conversations tests", () => {
		getAllConversations_tests(userURL, chatURL_HTTP);
	});

	describe("websocket connection tests", () => {
		websocket_chat_tests(userURL, chatURL_HTTP, chatURL_WS);
	});
});