export interface NotificationModel {
  id?: number;
  participantId: number;
  eventId?: number;
  type: string;
  message: string;
  dateCreation?: string;
  lue?: boolean;
}