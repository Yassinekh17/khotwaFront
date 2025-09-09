import { Injectable } from '@angular/core';
import { Evenement, Status_evenement } from './event.service';

export interface LocalInscription {
  id: string;
  eventId: number;
  event: Evenement;
  userInfo: {
    nom: string;
    email: string;
    telephone: string;
  };
  registrationDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

@Injectable({
  providedIn: 'root'
})
export class LocalInscriptionService {
  private readonly STORAGE_KEY = 'local_inscriptions';
  private readonly USER_ID = 'current_user_id';

  constructor() { }

  // Sauvegarder une inscription localement
  saveInscription(event: Evenement, userInfo: { nom: string; email: string; telephone: string }): LocalInscription {
    const inscription: LocalInscription = {
      id: this.generateId(),
      eventId: event.eventId!,
      event: { ...event },
      userInfo: { ...userInfo },
      registrationDate: new Date(),
      status: 'ACTIVE'
    };

    const inscriptions = this.getAllInscriptions();
    inscriptions.push(inscription);
    this.saveToStorage(inscriptions);

    console.log('💾 [LocalInscription] Inscription sauvegardée localement:', inscription);
    return inscription;
  }

  // Récupérer toutes les inscriptions locales
  getAllInscriptions(): LocalInscription[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const inscriptions = JSON.parse(stored);
      // Convertir les dates string en objets Date
      return inscriptions.map((insc: any) => ({
        ...insc,
        registrationDate: new Date(insc.registrationDate),
        event: {
          ...insc.event,
          date: new Date(insc.event.date)
        }
      }));
    } catch (error) {
      console.error('❌ [LocalInscription] Erreur lors de la récupération des inscriptions:', error);
      return [];
    }
  }

  // Récupérer les inscriptions d'un événement spécifique
  getInscriptionsByEventId(eventId: number): LocalInscription[] {
    return this.getAllInscriptions().filter(insc => insc.eventId === eventId);
  }

  // Vérifier si l'utilisateur est inscrit à un événement
  isUserRegisteredForEvent(eventId: number): boolean {
    return this.getInscriptionsByEventId(eventId).length > 0;
  }

  // Annuler une inscription
  cancelInscription(inscriptionId: string): boolean {
    const inscriptions = this.getAllInscriptions();
    const index = inscriptions.findIndex(insc => insc.id === inscriptionId);

    if (index !== -1) {
      inscriptions[index].status = 'CANCELLED';
      this.saveToStorage(inscriptions);
      console.log('🗑️ [LocalInscription] Inscription annulée:', inscriptionId);
      return true;
    }
    return false;
  }

  // Supprimer une inscription
  deleteInscription(inscriptionId: string): boolean {
    const inscriptions = this.getAllInscriptions();
    const filtered = inscriptions.filter(insc => insc.id !== inscriptionId);

    if (filtered.length !== inscriptions.length) {
      this.saveToStorage(filtered);
      console.log('🗑️ [LocalInscription] Inscription supprimée:', inscriptionId);
      return true;
    }
    return false;
  }

  // Marquer une inscription comme terminée (pour permettre les certificats)
  markAsCompleted(inscriptionId: string): boolean {
    const inscriptions = this.getAllInscriptions();
    const inscription = inscriptions.find(insc => insc.id === inscriptionId);

    if (inscription) {
      inscription.status = 'COMPLETED';
      this.saveToStorage(inscriptions);
      console.log('✅ [LocalInscription] Inscription marquée comme terminée:', inscriptionId);
      return true;
    }
    return false;
  }

  // Obtenir les statistiques des inscriptions
  getInscriptionStats() {
    const inscriptions = this.getAllInscriptions();
    return {
      total: inscriptions.length,
      active: inscriptions.filter(i => i.status === 'ACTIVE').length,
      completed: inscriptions.filter(i => i.status === 'COMPLETED').length,
      cancelled: inscriptions.filter(i => i.status === 'CANCELLED').length
    };
  }

  // Vider toutes les inscriptions (pour les tests)
  clearAllInscriptions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🧹 [LocalInscription] Toutes les inscriptions ont été supprimées');
  }

  // Méthodes privées
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveToStorage(inscriptions: LocalInscription[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inscriptions));
    } catch (error) {
      console.error('❌ [LocalInscription] Erreur lors de la sauvegarde:', error);
    }
  }

  // Méthode pour débogage
  logAllInscriptions(): void {
    const inscriptions = this.getAllInscriptions();
    console.log('📋 [LocalInscription] Toutes les inscriptions locales:', inscriptions);
    console.log('📊 [LocalInscription] Statistiques:', this.getInscriptionStats());
  }
}
