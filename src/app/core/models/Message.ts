export class Message{
    id_message ?: number;
    contenu!: String;
    dateEnvoi!: string;
    expediteurId !: number;
    likeCount?: number; 
    likedByUser?: boolean;
    commentCount?: number;
    commentaires?: Commentaire[];
}
export interface Commentaire {
    id?: number;
    contenu: string;
    dateCommentaire?: string;
    auteurId?: number;
  }
  