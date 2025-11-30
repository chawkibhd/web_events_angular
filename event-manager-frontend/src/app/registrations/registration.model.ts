export interface Registration {
  id?: number;
  eventId: number;
  participantId: number;
  dateInscription?: string;
  statut?: string; // INSCRIT, ANNULE, EN_ATTENTE
}