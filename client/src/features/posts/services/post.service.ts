import api from '../../../services/api';
import type { Post } from '../types/post'; // Usar 'import type'

export const postService = {
  getFeed: async (): Promise<Post[]> => {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  }
};