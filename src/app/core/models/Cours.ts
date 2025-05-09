export interface Cours {
    id_cours: number;
    titre: string;
    description: string;
    duree: number;
    prix: number;
    niveau: string;
    categorie: string;
    date_publication: Date;
    nb_etudiantsEnrolled: number;
    rating: number;
    format: string;
    fichier: string;
    image: string;
    video: string;
  }

  export interface Quizz {
    idQuizz?: number;
    nomQuizz: string;
    cours: Cours;
    questions?: Question[];
  }

  export interface Question {
    id_question?: number;
    ennonce: string;
    bonneReponse: string;
    quizz?: Quizz;
    reponses?: Reponse[];
  }
  
  export interface Reponse {
    id_reponse?: number;
    contenu: string;
    question?: Question;
  }