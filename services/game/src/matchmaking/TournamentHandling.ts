import {Player} from './Matchmaking.js'
import { v4 as uuidv4 } from 'uuid';

// Ajout de propriétés pour suivre l'état du tournoi
export type Tournament = {
    id: string;
    host: Player;
    name: string;
    players: Player[];
    status: 'waiting' | 'round1' | 'final' | 'completed';
    matches: TournamentMatch[];
    winners: Player[];
};

// Définition d'un match de tournoi
export type TournamentMatch = {
    id: string;
    player1: Player;
    player2: Player;
    winner?: Player;
    uuid_room: string;
    status: 'pending' | 'pre-active' | 'active' | 'completed';
    readyPlayers?: string[]; // Pour suivre les joueurs qui ont confirmé
};
const TournamenntsList: Tournament[] = [];

// Mise à jour de la fonction de création de tournoi
export function CreateTournament (Host: Player, tournamentName: string) {
    const tournament = {} as Tournament;
    tournament.id = uuidv4();
    tournament.host = Host;
    tournament.name = tournamentName;
    tournament.players = [];
    tournament.status = 'waiting';
    tournament.matches = [];
    tournament.winners = [];
    TournamenntsList.push(tournament);
    return tournament
}

export function DeleteTournament(uuid: string) {
    const tournamentIndex = TournamenntsList.findIndex(t => t.id === uuid);
    if (tournamentIndex !== -1) {
        TournamenntsList.splice(tournamentIndex, 1);
        return true;
    }
    return false;
}

// Lorsqu'un joueur est ajouté, vérifier si on peut lancer le tournoi
export function AddPlayerToTournament(uuid: string, player: Player): boolean {
    const tournament = TournamenntsList.find(t => t.id === uuid);
    if (tournament && tournament.players.length < 4) {
        tournament.players.push(player);
        
        // Si on a 4 joueurs, créer automatiquement les brackets
        if (tournament.players.length === 4 && tournament.status === 'waiting') {
            tournament.status = 'round1';
            CreateBracket(tournament);
        }
        
        return true;
    }
    return false;
}

export function RemovePlayerFromTournament(uuid: string, player: Player) {
    const tournament = TournamenntsList.find(t => t.id === uuid);
    if (tournament && tournament.players.find(p => p.user_id === player.user_id)) {
        tournament.players.splice(tournament.players.indexOf(player), 1);
        return true;
    }
    return false;
}

export function GetTournamentPlayers(uuid: string) {
    const tournament = TournamenntsList.find(t => t.id === uuid);
    if (tournament) {
        return tournament.players;
    }
    return [];
}

export function GetTournamentById(uuid: string) {
    const tournament = TournamenntsList.find(t => t.id === uuid);
    if (tournament) {
        return tournament;
    }
    return null;
}

export function GetAllTournaments() {
    return TournamenntsList;
}

export function RemoveTournament(uuid: string) {
    const tournamentIndex = TournamenntsList.findIndex(t => t.id === uuid);
    if (tournamentIndex !== -1) {
        TournamenntsList.splice(tournamentIndex, 1);
        return true;
    }
    return false;
}

// Créer les matchs du tournoi
export function CreateBracket(tournament: Tournament) {
    if (tournament.players.length < 4) {
        console.log("Not enough players to create bracket");
        return null;
    }
    
    // Match 1: joueurs 0 et 1
    const match1: TournamentMatch = {
        id: uuidv4(),
        player1: tournament.players[0],
        player2: tournament.players[1],
        uuid_room: uuidv4(),
        status: 'pending'
    };
    
    // Match 2: joueurs 2 et 3
    const match2: TournamentMatch = {
        id: uuidv4(),
        player1: tournament.players[2],
        player2: tournament.players[3],
        uuid_room: uuidv4(),
        status: 'pending'
    };
    
    tournament.matches = [match1, match2];
    
    // Retourner les matchs créés pour le premier tour
    return tournament.matches;
}

// Enregistrer le vainqueur d'un match
export function RecordMatchWinner(tournamentId: string, matchId: string, winner: Player): boolean {
    const tournament = GetTournamentById(tournamentId);
    if (!tournament) return false;
    
    const match = tournament.matches.find(m => m.id === matchId);
    if (!match) return false;
    
    match.winner = winner;
    match.status = 'completed';
    tournament.winners.push(winner);
    
    // Si les deux matchs du premier tour sont terminés, créer la finale
    const roundOneMatches = tournament.matches.slice(0, 2);
    if (roundOneMatches.every(m => m.status === 'completed') && tournament.status === 'round1') {
        tournament.status = 'final';
        createFinalMatch(tournament);
    }
    
    return true;
}

// Créer le match final
export function createFinalMatch(tournament: Tournament): TournamentMatch | null {
    // Vérifier que nous avons bien 2 vainqueurs pour la finale
    if (tournament.winners.length < 2) return null;
    
    // Créer le match final
    const finalMatch: TournamentMatch = {
        id: uuidv4(),
        player1: tournament.winners[0],
        player2: tournament.winners[1],
        uuid_room: uuidv4(),
        status: 'pending'
    };
    
    // Ajouter ce match au tournoi
    tournament.matches.push(finalMatch);
    
    return finalMatch;
}

// Récupérer les matchs en attente d'un tournoi
export function GetPendingMatches(tournamentId: string): TournamentMatch[] {
    const tournament = GetTournamentById(tournamentId);
    if (!tournament) return [];
    
    // Ne retourner que les matchs réellement en attente
    return tournament.matches.filter(m => m.status === 'pending');
}

// Mettre à jour le statut d'un match
export function UpdateMatchStatus(tournamentId: string, matchId: string, status: 'pending' | 'active' | 'completed' | 'pre-active'): boolean {
    const tournament = GetTournamentById(tournamentId);
    if (!tournament) return false;
    
    const match = tournament.matches.find(m => m.id === matchId);
    if (!match) return false;
    
    match.status = status;
    return true;
}