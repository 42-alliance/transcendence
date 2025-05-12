import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
    CreateTournament,
    GetAllTournaments,
    AddPlayerToTournament,
    RemovePlayerFromTournament,
    GetTournamentById,
    GetPendingMatches,
    UpdateMatchStatus,
    RecordMatchWinner,
    Tournament,
    TournamentMatch,
    createFinalMatch,
    DeleteTournament
} from './TournamentHandling.js';
import { sessions } from '../gameplay/gameplay.js';

// Ajouter au début du fichier, après les imports
const playerRooms = new Map<WebSocket, string>();
// Types
export interface Player {
    socket: WebSocket;
    username: string;
    user_id: string;
    type: GameMode;
    uuid_room: string;
    difficulty?: string;
}

export interface Match {
    players: Player[];
    type: GameMode;
    uuid_room: string;
    global_uuid?: string;
    tour_stat?: string;
}

export interface Session {
    match: Match;
}

// Types pour les différents modes de jeu
type GameMode = 'random_adversaire' | 'local' | 'ia' | 'tournament';

// Classes pour gérer les différentes files d'attente
class QueueManager {
    private queues: Map<GameMode, Player[]>;
    private pendingPlayers: Player[] = [];
    private static instance: QueueManager;

    private constructor() {
        this.queues = new Map<GameMode, Player[]>([
            ['random_adversaire', []],
            ['local', []],
            ['ia', []],
            ['tournament', []]
        ]);
    }

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    public addPlayerToPendingQueue(player: Player): void {
        this.pendingPlayers.push(player);
        console.log(`Player ${player.username} added to pending queue`);
    }

    public processPlayerQueues(): void {
        // Déplacer les joueurs de la file d'attente générale vers les files spécifiques
        while (this.pendingPlayers.length > 0) {
            const player = this.pendingPlayers.shift()!;
            const queue = this.queues.get(player.type);

            if (queue) {
                queue.push(player);
                console.log(`Player ${player.username} moved to ${player.type} queue`);
            } else {
                console.error(`Invalid game mode: ${player.type}`);
            }
        }
    }

    public getQueueByType(type: GameMode): Player[] {
        return this.queues.get(type) || [];
    }

    public removePlayerFromQueue(player: Player, type: GameMode): boolean {
        const queue = this.queues.get(type);
        if (!queue) return false;

        const index = queue.findIndex(p => p.socket === player.socket);
        if (index !== -1) {
            queue.splice(index, 1);
            console.log(`Player ${player.username} removed from ${type} queue`);
            return true;
        }
        return false;
    }

    public removePlayerFromAllQueues(player: Player): void {
        // Vérifier d'abord la file d'attente générale
        const pendingIndex = this.pendingPlayers.findIndex(p => p.socket === player.socket);
        if (pendingIndex !== -1) {
            this.pendingPlayers.splice(pendingIndex, 1);
            console.log(`Player ${player.username} removed from pending queue`);
            return;
        }

        // Vérifier ensuite toutes les files spécifiques
        for (const [type, queue] of this.queues.entries()) {
            if (this.removePlayerFromQueue(player, type as GameMode)) {
                return;
            }
        }
    }
}

// Classe pour gérer les matchs
class MatchManager {
    private sessions: Session[] = [];
    private static instance: MatchManager;

    private constructor() { }

    public static getInstance(): MatchManager {
        if (!MatchManager.instance) {
            MatchManager.instance = new MatchManager();
        }
        return MatchManager.instance;
    }

    public createMatch(players: Player[], type: GameMode): Session {
        const uuid_room = uuidv4();
        const match: Match = {
            players,
            type,
            uuid_room
        };

        const session: Session = { match };
        this.sessions.push(session);

        players.forEach(player => {
            player.uuid_room = uuid_room;
            playerRooms.set(player.socket, uuid_room);
        });

        console.log(`Match created - Type: ${type}, Room: ${uuid_room}, Players: ${players.map(p => p.username).join(', ')}`);
        return session;
    }

    public createTournamentMatch(players: Player[], type: 'tournament', roomUuid: string, tournamentId: string, stat: string ): Session {
        const match: Match = {
            players,
            type,
            uuid_room: roomUuid,
            global_uuid: tournamentId,
            tour_stat: stat
        };

        const session: Session = { match };
        this.sessions.push(session);

        // Associer chaque joueur à la salle
        players.forEach(player => {
            player.uuid_room = roomUuid;
            playerRooms.set(player.socket, roomUuid);
        });

        console.log(`Tournament match created - Room: ${roomUuid}, Players: ${players.map(p => p.username).join(', ')}`);
        return session;
    }

    public processMatches(): void {
        const queueManager = QueueManager.getInstance();

        // Traiter les matchs en ligne (requiert 2 joueurs)
        const onlineQueue = queueManager.getQueueByType('random_adversaire');
        while (onlineQueue.length >= 2) {
            const players = [onlineQueue.shift()!, onlineQueue.shift()!];
            const session = this.createMatch(players, 'random_adversaire');
            all_sessions.push(session);

            // Notifier les joueurs que le match est créé
            players.forEach(player => {
                notifyWaiting(player.socket);
            });
        }

        // Traiter les matchs locaux (requiert 1 joueur)
        const localQueue = queueManager.getQueueByType('local');
        while (localQueue.length >= 1) {
            const player = localQueue.shift()!;
            const session = this.createMatch([player], 'local');
            all_sessions.push(session);
        }

        // Traiter les matchs IA (requiert 1 joueur)
        const iaQueue = queueManager.getQueueByType('ia');
        while (iaQueue.length >= 1) {
            const player = iaQueue.shift()!;
            const session = this.createMatch([player], 'ia');
            all_sessions.push(session);
        }
    }

    public getSessionByRoom(roomId: string): Session | undefined {
        return this.sessions.find(session => session.match.uuid_room === roomId);
    }
}

// Classe pour gérer les messages WebSocket
class WebSocketMessageHandler {
    private player: Player;
    private socket: WebSocket;

    constructor(socket: WebSocket, player: Player) {
        this.socket = socket;
        this.player = player;
    }

    public handleMessage(data: any): void {
        console.log(`Handling message of type: ${data.type}`);

        // IMPORTANT: Réinitialiser l'UUID de la salle au début de chaque nouveau jeu
        if (data.type === 'random_adversaire' || data.type === 'local' ||
            data.type === 'ia' || data.type === 'tournament') {
            // Réinitialiser l'UUID de salle pour les nouvelles demandes de jeu
            this.player.uuid_room = '';
            playerRooms.delete(this.player.socket);
        }

        switch (data.type) {
            case 'random_adversaire':
                this.handleRandomGame(data);
                break;

            case 'local':
                this.handleLocalGame(data);
                break;

            case 'ia':
                this.handleIAGame(data);
                break;

            case 'create_tournament':
                this.handleCreateTournament(data);
                break;

            case 'join_tournament':
                this.handleJoinTournament(data);
                break;

            case 'get_all_tournaments':
                this.handleGetAllTournaments(data);
                break;
            case 'leave_tournament':
                this.handleLeaveTournament(data);
                break;

            case 'tournament_player_ready':
                this.handleTournamentPlayerReady(data);
                break;

            default:
                console.error(`Unknown message type: ${data.type}`);
        }
    }

    private handleRandomGame(data: any): void {
        this.player.username = data.user.name;
        this.player.user_id = data.user.id;
        this.player.type = 'random_adversaire';

        if (data.uuid_room) {
            this.player.uuid_room = data.uuid_room;
        }

        const queueManager = QueueManager.getInstance();
        queueManager.addPlayerToPendingQueue(this.player);

        notifyWaiting(this.socket);
    }

    private handleLocalGame(data: any): void {
        this.player.username = data.user.name;
        this.player.type = 'local';
        this.player.user_id = data.user.id;

        const queueManager = QueueManager.getInstance();
        queueManager.addPlayerToPendingQueue(this.player);
    }

    private handleIAGame(data: any): void {
        this.player.username = data.user.name;
        this.player.type = 'ia';
        this.player.difficulty = data.difficulty;
        this.player.user_id = data.user.id;

        const queueManager = QueueManager.getInstance();
        queueManager.addPlayerToPendingQueue(this.player);
    }

    private handleCreateTournament(data: any): void {
        this.player.username = data.user.name;
        this.player.user_id = data.user.id;

        const tournament = CreateTournament(this.player, data.tournament_name);

        if (tournament) {
            this.player.type = 'tournament';
            this.player.uuid_room = tournament.id;

            AddPlayerToTournament(tournament.id, this.player);

            secureSend(this.socket, {
                type: 'tournament_created',
                tournament: tournament,
                name: tournament.name,
                id: tournament.id,
                players: tournament.players
            });

            console.log(`Tournament created: ${tournament.name} (${tournament.id})`);
        }
    }

    private handleJoinTournament(data: any): void {
        this.player.username = data.user.name;
        this.player.user_id = data.user.id;
        this.player.type = 'tournament';

        const tournamentId = data.tournament_id;
        const tournament = GetTournamentById(tournamentId);

        if (tournament) {
            //si l'user est deja dans un tournoi, le faire quitter
            if (this.player.uuid_room) {
                RemovePlayerFromTournament(this.player.uuid_room, this.player);
            }
            this.player.uuid_room = tournamentId;
            AddPlayerToTournament(tournamentId, this.player);
            secureSend(this.socket, {
                type: 'tournament_joined',
                tournament: tournament,
                players: tournament.players
            });
            // Notifier tous les joueurs du tournoi
            this.broadcastTournamentUpdate(tournament);

        } else {
            secureSend(this.socket, {
                type: 'error',
                message: 'Tournament not found'
            });
        }
    }

    private handleGetAllTournaments(data: any): void {
        console.log("Get all tournaments request received");

        secureSend(this.socket, {
            type: 'all_tournaments',
            request_id: data.request_id,
            tournaments: GetAllTournaments()
        });
    }

    private handleLeaveTournament(data: any): void {
        const tournamentId = data.tournament_id;
        const tournament = GetTournamentById(tournamentId);
        if (tournament) {
            RemovePlayerFromTournament(tournamentId, this.player);
            this.player.uuid_room = '';
            if (tournament.players.length === 0) {
                DeleteTournament(tournamentId);
            }
            //if host leave tournament delete tournament
            else if (tournament.host.user_id === this.player.user_id) {
                //send to all player in the room
                for (const player of tournament.players) {
                    secureSend(player.socket, {
                        type: 'tournament_deleted',
                        tournament_id: tournamentId
                    });
                }
                DeleteTournament(tournamentId); 
            }
            else {
                this.broadcastTournamentUpdate(tournament);
            }
        }
    }

    private handleTournamentPlayerReady(data: any): void {
        const tournamentId = data.tournament_id;
        const tournament = GetTournamentById(tournamentId);
        
        if (!tournament) {
            console.error(`Tournament ${tournamentId} not found`);
            return;
        }
        
        // Trouver le match en statut pre-active où ce joueur participe
        const match = tournament.matches.find(m => 
            m.status === 'pre-active' && 
            (m.player1.user_id === this.player.user_id || m.player2.user_id === this.player.user_id)
        );
        
        if (!match) {
            console.error(`No pre-active match found for player ${this.player.username}`);
            return;
        }
        
        // Initialiser le tableau des joueurs prêts si nécessaire
        if (!match.readyPlayers) {
            match.readyPlayers = [];
        }
        
        // Ajouter ce joueur aux joueurs prêts s'il n'est pas déjà là
        if (!match.readyPlayers.includes(this.player.user_id)) {
            match.readyPlayers.push(this.player.user_id);
        }
        
        // Si les deux joueurs sont prêts, démarrer le match
        if (match.readyPlayers.length === 2) {
            console.log(`Both players ready for match ${match.id}, starting game`);
            
            // Créer une session de match pour ce match de tournoi
            const matchManager = MatchManager.getInstance();
            const session = matchManager.createTournamentMatch(
                [match.player1, match.player2],
                'tournament',
                match.uuid_room,
                tournament.id,
                tournament.status === 'final' ? 'final' : 'round1'
            );
            
            // Ajouter la session à la liste des sessions
            all_sessions.push(session);
            
            // Marquer le match comme actif
            UpdateMatchStatus(tournament.id, match.id, 'active');
        } else {
            console.log(`Player ${this.player.username} ready for match ${match.id}, waiting for opponent`);
        }
    }

    private broadcastTournamentUpdate(tournament: Tournament): void {
        tournament.players.forEach((player: Player) => {
            if (player.socket && player.socket !== this.socket) {
                console.log(`Notifying player ${player.username} about tournament update`);
                secureSend(player.socket, {
                    type: 'tournament_players_update',
                    tournament_id: tournament.id,
                    players: tournament.players.map(({ username, user_id, type, uuid_room }) => ({
                        username,
                        user_id,
                        type,
                        uuid_room
                    }))
                });
            }
        });
    }
}

// Classes et variables globales
export const all_sessions: Session[] = [];
export const wss = new WebSocketServer({ port: 8790 });

// Initialisation du matchmaking
export async function setupMatchmaking() {

    // Configuration du serveur WebSocket
    wss.on('connection', function connection(ws) {
        let connectedPlayer: Player | null = null;
        let gameRoom: string | null = null;

        ws.on('message', function incoming(message) {
            try {
                const data = JSON.parse(message.toString());

                // Initialiser le joueur s'il n'existe pas
                if (!connectedPlayer) {
                    connectedPlayer = {
                        socket: ws,
                        username: '',
                        user_id: '',
                        type: 'random_adversaire',
                        uuid_room: ''
                    };
                }

                if (data.type === 'random_adversaire' || data.type === 'local' ||
                    data.type === 'ia' || data.type === 'tournament') {

                    // Effacer l'ancien UUID de la carte de suivi
                    playerRooms.delete(ws);

                    // Réinitialiser l'UUID de la salle dans les variables locales
                    gameRoom = null;
                    connectedPlayer.uuid_room = '';
                }

                // Mettre à jour l'ID de salle si présent dans le message
                if (data.uuid_room) {
                    gameRoom = data.uuid_room;
                    connectedPlayer.uuid_room = data.uuid_room;
                    playerRooms.set(ws, data.uuid_room);
                }
                const messageHandler = new WebSocketMessageHandler(ws, connectedPlayer);
                messageHandler.handleMessage(data);

                // Mettre à jour gameRoom après traitement du message
                if (connectedPlayer.uuid_room && connectedPlayer.uuid_room !== '') {
                    gameRoom = connectedPlayer.uuid_room;
                    playerRooms.set(ws, connectedPlayer.uuid_room);
                }

            } catch (error) {
                console.error("Error processing message:", error);

                secureSend(ws, {
                    type: 'error',
                    message: 'Invalid message format'
                });
            }
        });

        ws.on('close', function () {
            // Récupérer la dernière salle connue depuis la carte de suivi
            const storedGameRoom = playerRooms.get(ws);
            handleDisconnection(ws, connectedPlayer, storedGameRoom ?? null);
        });
    });

    startQueueProcessing();
    startMatchProcessing();
}

// Fonctions utilitaires
function startQueueProcessing() {
    setInterval(() => {
        const queueManager = QueueManager.getInstance();
        queueManager.processPlayerQueues();
        processAllTournaments(); // Ajouter l'appel ici
    }, 1000);
}

function startMatchProcessing() {
    setInterval(() => {
        const matchManager = MatchManager.getInstance();
        matchManager.processMatches();
    }, 1000);
}

function handleDisconnection(ws: WebSocket, player: Player | null, gameRoom: string | null) {
    if (!player) return;

    console.log(`Player ${player.username || 'unknown'} disconnected`);

    if (!gameRoom && player) {
        gameRoom = playerRooms.get(ws) || player.uuid_room || null;
    }

    const queueManager = QueueManager.getInstance();
    queueManager.removePlayerFromAllQueues(player);

    // Gestion du tournoi si applicable
    if (player.type === 'tournament' && player.uuid_room) {
        RemovePlayerFromTournament(player.uuid_room, player);

        // Notifier les autres joueurs du tournoi
        const tournament = GetTournamentById(player.uuid_room);
        if (tournament) {
            tournament.players.forEach(p => {
                if (p.socket) {
                    secureSend(p.socket, {
                        type: 'tournament_players_update',
                        tournament_id: tournament.id,
                        players: tournament.players
                    });
                }
            });
        }
    }

    // Gérer la déconnexion pendant un jeu actif
    if (gameRoom) {
        console.log(`Checking for active game in room: ${gameRoom}`);
        const gameSession = Array.from(sessions.values()).find(session =>
            session.uuid_room === gameRoom ||
            (session.match && session.uuid_room === gameRoom)
        );

        if (gameSession) {
            console.log(`Found active game session: ${gameRoom}`);
            if (gameSession.p1 && gameSession.p1.ws === ws) {
                console.log(`Player disconnected as P1`);
                gameSession.handleDisconnection('p1');
            } else if (gameSession.p2 && gameSession.p2.ws === ws) {
                console.log(`Player disconnected as P2`);
                gameSession.handleDisconnection('p2');
            } else {
                console.log('Player not found in session players');
            }
        } else {
            console.log(`No active game session found for room: ${gameRoom}`);
        }
    }

    // Nettoyer la carte de suivi
    playerRooms.delete(ws);
}

function notifyWaiting(ws: WebSocket): void {
    secureSend(ws, {
        type: 'waiting',
        message: 'Waiting for opponent'
    });
}

function secureSend(ws: WebSocket, message: any): void {
    try {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

function processAllTournaments() {
    // Récupérer tous les tournois
    const tournaments = GetAllTournaments();

    for (const tournament of tournaments) {
        // Ne traiter que les tournois avec suffisamment de joueurs et en attente
        if (tournament.status === 'round1' || tournament.status === 'final') {
            const pendingMatches = GetPendingMatches(tournament.id);

            for (const match of pendingMatches) {
                console.log(`Starting tournament match: ${match.player1.username} vs ${match.player2.username}`);

                // Mettre à jour le statut du match à 'pre-active' au lieu de 'active'
                UpdateMatchStatus(tournament.id, match.id, 'pre-active');

                // Notifier les joueurs et attendre leur confirmation
                [match.player1, match.player2].forEach(player => {
                    secureSend(player.socket, {
                        type: 'tournament_match_starting',
                        tournament_id: tournament.id,
                        tournament: tournament.name,
                        opponent: player === match.player1 ? match.player2.username : match.player1.username,
                        match_id: match.id
                    });
                });
            }
        }
    }
}

export function handleTournamentMatchEnd(roomUuid: string, winnerId: string, tournamentId: string) {
    const tournament = GetTournamentById(tournamentId);
    if (!tournament) return;

    const match = tournament.matches.find(m => m.uuid_room === roomUuid);
    if (!match) return;

    const winner = match.player1.user_id === winnerId ? match.player1 : match.player2;

    RecordMatchWinner(tournamentId, match.id, winner);

    // Notifier tous les joueurs du tournoi
    tournament.players.forEach(player => {
        secureSend(player.socket, {
            type: 'tournament_match_result',
            tournament_id: tournamentId,
            match_id: match.id,
            winner_id: winner.user_id,
        });

        // Si une finale vient de se terminer, notifier que le tournoi est terminé
        if (tournament.status === 'final' && tournament.matches.every(m => m.status === 'completed')) {
            tournament.status = 'completed';
            secureSend(player.socket, {
                type: 'tournament_completed',
                tournament_id: tournamentId,
                winner: winner.user_id
            });
        }
    });

    // Si tous les matchs du premier tour sont terminés, notifier que la finale va commencer
    const roundOneMatches = tournament.matches.slice(0, 2);
    if (roundOneMatches.every(m => m.status === 'completed') && tournament.status === 'round1') {
        // Changer le statut du tournoi
        tournament.status = 'final';

        // Créer le match final
        //attendre 20 secondes avant de créer le match final
        setTimeout(() => {
           
        }, 40000);

        const finalMatch = createFinalMatch(tournament);
       
        if (finalMatch) {
            // Envoyer un signal spécial aux finalistes pour qu'ils sachent qu'ils sont en finale
            tournament.winners.forEach(player => {
                if (player.socket) {
                    secureSend(player.socket, {
                        type: 'tournament_final_match',
                        tournament_id: tournamentId,
                        match_id: finalMatch.id,
                        opponent: tournament.winners.find(w => w.user_id !== player.user_id)?.username || 'Opponent'
                    });
                }
            });

            // Démarrer immédiatement la finale (au lieu d'attendre le prochain cycle de processAllTournaments)
            console.log(`Starting final match: ${tournament.winners[0].username} vs ${tournament.winners[1].username}`);

            // Créer une session de match pour ce match de tournoi
            const matchManager = MatchManager.getInstance();
            const session = matchManager.createTournamentMatch(
                tournament.winners,
                'tournament',
                finalMatch.uuid_room,
                tournamentId,
                'final'
            );
            all_sessions.push(session);

            UpdateMatchStatus(tournamentId, finalMatch.id, 'active');
        }
    }
}