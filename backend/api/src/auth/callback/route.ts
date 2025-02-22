import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";


async function  getUserGoogleInfo(request: FastifyRequest) {
    
    const code = request.query as {
        code: string
    }

    console.log("[google infos] - code => ", code.code);

    const rspBody = {
        'grand_type': 'authorization_code',
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'code': code.code, // le code contenue dans le body du context
        'redirect_uri': 'http://localhost:3000/auth/callback/'
    }

	try {
		const response = await fetch("https://accounts.google.com/o/oauth2/google-callback", {
			method: 'POST',
            body: JSON.stringify(rspBody) 
		});

        if (!response.ok) {
            console.error("[google infos] - error in response => ", response);
            return
        }
        const data = await response.json();
        console.error("[google infos] - response => ", data);
	} catch (error) {
		console.error(error);
	}
	

    
}

export async function authCallback(server: FastifyInstance, request: FastifyRequest, reply: FastifyReply ) {
	
	// console.error("request: ", request.url);
	await getUserGoogleInfo(request);
		
    return reply.status(200).send({"message": request.body});
}