interface ISession {
  sessionId: string;
  email: string | null;
  phone: string | null;
  tags: string[];
}