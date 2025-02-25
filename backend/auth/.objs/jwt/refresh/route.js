export async function refreshJWT(server, request, reply) {
    const { authorization } = request.headers;
    if (!authorization) {
        return reply.status(401).send({ error: 'No authorization header' });
    }
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
        return reply.status(401).send({ error: 'No refresh token' });
    }
    try {
        const decoded = server.jwt.verify(refreshToken);
        if (!decoded || !decoded.id) {
            return reply.status(401).send({ error: 'Invalid refresh token' });
        }
        const userId = decoded.id;
        const query = "SELECT * FROM users WHERE id = ?";
        const user = await server.db.get(query, [userId]);
        if (!user) {
            return reply.status(401).send({ error: 'User not found' });
        }
        if (user.refresh_token !== refreshToken || user.access_token !== authorization) {
            return reply.status(401).send({ error: 'Invalid token' });
        }
        const accessToken = server.jwt.sign({ id: userId }, { expiresIn: '15m' });
        const updateQuery = "UPDATE users SET access_token = ? WHERE id = ?";
        await server.db.run(updateQuery, [accessToken, userId]);
        return reply.status(200).send({ accessToken });
    }
    catch (error) {
        console.error('Error refreshing JWT:', error);
        return reply.status(401).send({ error: 'Invalid or expired refresh token' });
    }
}
//# sourceMappingURL=route.js.map