export const addFriendSchema = {
    headers: {
        type: 'object',
        properties: {
            "x-user-id": {type: 'string'}
        },
        required: ['x-user-id'],
    }
}

export const areFriendsSchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' },
            friendId: { type: 'number' }
        },
        required: ['id', 'friendId']
    }
};

export const pendingRequestsSchema = {
    params: {
        type: 'object',
        properties: {
            userId: { type: 'number' }
        },
        required: ['userId']
    }
};