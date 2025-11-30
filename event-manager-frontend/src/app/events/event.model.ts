export interface EventModel {
  id?: number;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;  // ISO string (ex: "2025-11-20T18:00:00")
  dateFin: string;
  type: string;       // conférence, formation, concert, etc.
  imageUrl?: string;
  programmeUrl?: string;
  organisateurId?: number;
}