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
  