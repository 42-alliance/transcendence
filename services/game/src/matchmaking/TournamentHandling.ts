import {Player} from './Matchmaking.js'
import { v4 as uuidv4 } from 'uuid';

// Define the tournament type
type Tournament = {
    id: string;
    host: Player;
    name: string;
    players: Player[];
};

const TournamenntsList: Tournament[] = [];

export function CreateTournament (Host: Player, tournamentName: string) {
    const tournament = {} as Tournament;
    tournament.id = uuidv4();
    tournament.host = Host;
    tournament.name = tournamentName;
    // tournament.players.push({} as Player);
    tournament.players = [];
    TournamenntsList.push(tournament);
    return tournament
}


export function AddPlayerToTournament(uuid: string, player: Player) {
    const tournament = TournamenntsList.find(t => t.id === uuid);
    if (tournament  && tournament.players.length < 4) {
        tournament.players.push(player);
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