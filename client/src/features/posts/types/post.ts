export interface Post {
  id: number;
  content: string;
  createdAt: string;
  user?: {
    username: string;
    displayName: string;
  };
}