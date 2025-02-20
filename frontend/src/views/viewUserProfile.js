

export function viewUserProfile() {
	const modal = new bootstrap.Modal('#openFriendModal', {});
	modal.show();
	setTimeout(() => {
		addFriendInput.focus();
		addFriendInput.select();
	}, 500)	
}

