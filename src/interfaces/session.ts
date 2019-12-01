export interface ISession {
  sessionId: string,
  email: string | null,
  phone: string | null,
  dateTime: string,
  date: number,
  tags: string[],
}