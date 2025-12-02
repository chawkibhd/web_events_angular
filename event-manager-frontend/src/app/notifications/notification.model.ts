export interface NotificationModel {
  id?: number;
  participantId: number;
  eventId?: number;
  type: string;
  message: string;
  dateCreation?: string;
  lue?: boolean;
  /** Etat local de décision prise par l'organisateur */
  decision?: 'ACCEPTEE' | 'REFUSEE';
  /** Message d'origine pour pouvoir revenir en arrière localement */
  originalMessage?: string;
}
