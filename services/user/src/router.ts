import { FastifyInstance } from "fastify";
import {
  getFriendStatus,
  getFriendStatusSchema,
} from "./friends/status/getFriendStatus.js";
import {
  updateLastSeen,
  updateUserInfos,
} from "./users/@me/updateUserInfos.js";
import {
  deleteUserDatabase,
  deleteUserDatabaseSchema,
} from "./users/delete.user.js";
import { addFriend, addFriendSchema } from "./friends/addFriend.js";
import { removeFriend, removeFriendSchema } from "./friends/removeFriend.js";
import { getFriends, getFriendsSchema } from "./friends/getFriends.js";
import {
  updateFriendStatus,
  updateFriendStatusSchema,
} from "./friends/status/updateFriendsStatus.js";
import { getAllUsers, getAllUsersSchema } from "./users/getAllUsers.js";
import { getUserByName, getUserByNameSchema } from "./users/getUserByName.js";
import { addUserDatabase, addUserDatabaseSchema } from "./users/addUser.js";
import { UpdateTwoFa } from "./users/@me/updateUserInfos.js";
import { setup2Fa, setup2FaSchema } from "./users/@me/setupTwoFa.js";
import { me, meSchema } from "./users/@me/@me.js";
import { verify_2fa_code_setup, verify_2fa_code_setupSchema } from "./users/@me/verifyTwoFaSetup.js";
import { verify_2fa_codeSchema, verify_2fa_code,  } from "./users/@me/verifyTwoFaLogin.js";
import {
  getSendFriendRequest,
  getSendFriendRequestSchema,
} from "./friends/pending/getSendFriendRequest.js";
import { storeGameDatabase } from "./game/storeGameDatabase.js";
import { getUserBlockedList } from "./users/getUserBlockedList.js";
import { unblockSomeone } from "./friends/status/unblockSomeone.js";
import { blockSomeone } from "./friends/status/blockSomeone.js";
// import { check2faEnabled } from "./users/@me/check2faEnabled.js";
// FIX: Update the path or create the file if missing
import { check2faEnabled } from "./users/@me/check2faEnabled.js";

/**
 * Configure les routes pour les utilisateurs.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupUsersRoute(server: FastifyInstance) {
  server.get(
    "/users",
    { schema: getAllUsersSchema },
    async function handler(request, reply) {
      return await getAllUsers(reply);
    }
  );

  server.get<{ Params: { name: string } }>(
    "/users/:name",
    { schema: getUserByNameSchema },
    async function handler(request, reply) {
      return await getUserByName(request, reply);
    }
  );

  server.delete(
    "/users",
    { schema: deleteUserDatabaseSchema },
    async function handler(request, reply) {
      return await deleteUserDatabase(request, reply);
    }
  );

  server.post(
    "/users",
    { schema: addUserDatabaseSchema },
    async function handler(request, reply) {
      return await addUserDatabase(request, reply);
    }
  );

  server.get(
    "/users/@me",
    { schema: meSchema },
    async function handler(request, reply) {
      return await me(request, reply);
    }
  );

  // Dans setupUsersRoute, ajoutez cette nouvelle route
  server.get(
    "/users/@me/2fa/setup",
    { schema: setup2FaSchema },
    async function handler(request, reply) {
        return await setup2Fa(request, reply);
    }
  );

  server.post<{
    Body: { code: string };
  }>(
    "/users/@me/2fa/setup/verify",
    { schema: verify_2fa_code_setupSchema },
    async function handler(request, reply) {
        return await verify_2fa_code_setup(request, reply);
    }
  );

  server.post<{
    Body: { code: string };
  }>(
    "/users/@me/2fa/verify",
    { schema: verify_2fa_codeSchema },
    async function handler(request, reply) {
        return await verify_2fa_code(request, reply);
    }
  );

  server.put<{
    Body: { enabled: boolean };
  }>(
    "/users/@me/twofa",
    {
      schema: {
        body: {
          type: "object",
          required: ["enabled"],
          properties: {
            enabled: { type: "boolean" },
          },
          additionalProperties: false,
        },
      },
    },
    async function handler(request, reply) {
      try {
        console.log("********************etape 1 reussi*********************");
        const { enabled } = request.body;
        console.log("Received two-factor authentication request:", { enabled });

        return await UpdateTwoFa(request, reply);
      } catch (error) {
        console.error("Error processing twofa request:", error);
        reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
  server.get("/users/@me/twofa", async function handler(request, reply) {
    try {
      const isEnabled = await check2faEnabled(request, reply);
      reply.send({ enabled: isEnabled });
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      reply.status(500).send({ error: "Internal server error" });
    }
  });
}

/**
 * Configure les routes pour la gestion d'amis.
 *
 * @param {FastifyInstance} server - Instance du serveur Fastify.
 */
async function setupFriendsRoute(server: FastifyInstance) {
  // Envoyer une demande d'ami
  server.post(
    "/friends/requests",
    { schema: addFriendSchema },
    async function handler(request, reply) {
      return await addFriend(request, reply);
    }
  );

  // Supprimer une relation d'amitié ou une demande d'ami
  server.delete<{ Params: { friendId: string } }>(
    "/friends/:friendId",
    { schema: removeFriendSchema },
    async function handler(request, reply) {
      return await removeFriend(request, reply);
    }
  );

  // Obtenir la liste des amis
  server.get(
    "/friends/list",
    { schema: getFriendsSchema },
    async function handler(request, reply) {
      return await getFriends(request, reply);
    }
  );

  // Mettre à jour le statut d'une demande d'ami
  server.post<{ Params: { friendId: string } }>(
    "/friends/requests/:friendId/status",
    { schema: updateFriendStatusSchema },
    async function handler(request, reply) {
      return await updateFriendStatus(request, reply);
    }
  );

  server.get<{ Params: { friendId: string } }>(
    "/friends/status/:friendId",
    { schema: getFriendStatusSchema },
    async function handler(request, reply) {
      return await getFriendStatus(request, reply);
    }
  );

  // Obtenir les demandes d'amis envoye
  server.get(
    "/friends/requests/send",
    { schema: getSendFriendRequestSchema },
    async function handler(request, reply) {
      return await getSendFriendRequest(request, reply);
    }
  );
}

async function setupGameRoute(server: FastifyInstance) {
  server.post("/game/store", async function handler(request, reply) {
    return await storeGameDatabase(request, reply);
  });
}

async function setupBlockRoute(server: FastifyInstance) {
  server.post<{ Params: { friendId: string } }>(
    "/users/block/:friendId",
    async function handler(request, reply) {
      await blockSomeone(request, reply);
    }
  );

  server.delete<{ Params: { friendId: string } }>(
    "/users/unblock/:friendId",
    async function handler(request, reply) {
      return await unblockSomeone(request, reply);
    }
  );
}

export async function setupRoutes(server: FastifyInstance) {
  await setupUsersRoute(server);
  await setupFriendsRoute(server);
  await setupBlockRoute(server);
  await setupGameRoute(server);
}
