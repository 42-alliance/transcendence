import { fetchApi, getHeader } from "../utils.js";
import { displayPendingFriendsDynamically } from "../Views/Friends/Friends.js";
import { showToast } from "../Views/triggerToast.js";
import { updateFriendStatus } from "./updateFriendStatus.js";


export async function addFriend(username: string) {
	try {
		const header = getHeader();
		header.append('Content-Type', 'application/json');

		const response = await fetchApi("http://localhost:8000/friends/requests", {
			method: "POST",
			headers: header,
			body: JSON.stringify({
				friendName: username,
			}),
		});

		if (!response.ok) {
			throw new Error("fail to add friend: ",  await response.json());
		}

		const result = await response.json();

		if (result.message === "Friend request is now accepted")
			return;
		const id = Number(result.friend.id);
		showToast({
			text: `Friend request send to ${username}`,
			img: "/assets/valid.jpg",
			buttons: [ {label: "Cancel", onClick: async () => { await updateFriendStatus(id, "rejected");} } ],
			duration: 8000
		});
		await displayPendingFriendsDynamically();
		console.log("result: ", result);
	} catch (error) {
		console.error("Error: ", error);
	}
}
