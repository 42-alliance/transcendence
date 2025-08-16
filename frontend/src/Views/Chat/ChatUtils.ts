import { Member } from "../../types.js";

export function createConversationName(otherMembers: Member[]): string {
	let str = "";
	otherMembers.forEach(member => {
		str += `<a href="/${member.name}"
				 class="hover:underline hover:text-orange-400 transition-colors"
				 data-link>${member.name}</a>, `;
	});
	if (str.length > 0) {
		str = str.slice(0, -2); // Remove trailing comma and space
	}
	return str;
}

export function createConversationNameNoClick(otherMembers: Member[]): string {
	let str = "";
	otherMembers.forEach(member => {
		str += member.name + ", ";
	});
	if (str.length > 0) {
		str = str.slice(0, -2); // Remove trailing comma and space
	}
	return str;
}