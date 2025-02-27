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
