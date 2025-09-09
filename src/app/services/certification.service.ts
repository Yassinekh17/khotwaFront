import { Injectable } from '@angular/core';
import { Evenement } from './event.service';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {

  constructor() { }

  generateCertificate(event: Evenement, studentName: string = 'John Doe', includeBackground: boolean = false): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Fond blanc propre
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Grand cadre rouge autour de tout le certificat
        this.addLargeRedBorder(pdf, pageWidth, pageHeight);

        // Contenu organisé et simplifié
        this.addSimpleCertificateContent(pdf, pageWidth, pageHeight, event, studentName);

        // Générer le blob PDF
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);

      } catch (error) {
        console.error('Erreur lors de la génération du certificat:', error);
        reject(error);
      }
    });
  }

  private createModernBackground(pdf: jsPDF, width: number, height: number): void {
    // Arrière-plan moderne avec dégradé bleu-violet
    const colors = [
      [59, 130, 246],   // Bleu clair
      [79, 150, 246],   // Bleu moyen
      [99, 170, 246],   // Bleu plus foncé
      [119, 190, 246],  // Bleu-violet
      [139, 210, 246],  // Violet clair
      [147, 51, 234]    // Violet TechEvents
    ];

    // Créer un dégradé vertical fluide
    const steps = 50;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const colorIndex = Math.floor(ratio * (colors.length - 1));
      const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
      const colorRatio = (ratio * (colors.length - 1)) - colorIndex;

      const r = Math.round(colors[colorIndex][0] * (1 - colorRatio) + colors[nextColorIndex][0] * colorRatio);
      const g = Math.round(colors[colorIndex][1] * (1 - colorRatio) + colors[nextColorIndex][1] * colorRatio);
      const b = Math.round(colors[colorIndex][2] * (1 - colorRatio) + colors[nextColorIndex][2] * colorRatio);

      pdf.setFillColor(r, g, b);
      pdf.rect(0, (i * height) / steps, width, height / steps + 1, 'F');
    }

    // Ajouter des formes géométriques modernes en arrière-plan
    this.addGeometricShapes(pdf, width, height);
  }

  private addGeometricShapes(pdf: jsPDF, width: number, height: number): void {
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.05 }));

    // Cercles décoratifs
    pdf.circle(50, 50, 30, 'F');
    pdf.circle(width - 50, height - 50, 25, 'F');
    pdf.circle(width / 2, height / 3, 20, 'F');

    // Triangles modernes
    pdf.triangle(20, 20, 50, 20, 35, 50, 'F');
    pdf.triangle(width - 20, height - 20, width - 50, height - 20, width - 35, height - 50, 'F');

    // Restaurer l'opacité normale
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
  }

  private addModernDecorativeElements(pdf: jsPDF, width: number, height: number): void {
    // Bordure moderne avec coins arrondis
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(3);
    pdf.roundedRect(10, 10, width - 20, height - 20, 10, 10, 'S');

    // Lignes décoratives diagonales
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.3 }));

    // Lignes diagonales dans les coins
    pdf.line(15, 15, 35, 15);
    pdf.line(15, 15, 15, 35);
    pdf.line(width - 15, 15, width - 35, 15);
    pdf.line(width - 15, 15, width - 15, 35);
    pdf.line(15, height - 15, 35, height - 15);
    pdf.line(15, height - 15, 15, height - 35);
    pdf.line(width - 15, height - 15, width - 35, height - 15);
    pdf.line(width - 15, height - 15, width - 15, height - 35);

    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
  }

  private addModernTitle(pdf: jsPDF, width: number): void {
    // Titre principal avec style moderne
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(42);
    pdf.setTextColor(255, 255, 255); // Blanc sur fond coloré

    // Ajouter un effet d'ombre au texte
    pdf.setTextColor(0, 0, 0);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.2 }));
    pdf.text('CERTIFICATE OF COMPLETION', width / 2 + 1, 41, { align: 'center' });
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

    // Texte principal
    pdf.setTextColor(255, 255, 255);
    pdf.text('CERTIFICATE OF COMPLETION', width / 2, 40, { align: 'center' });

    // Ligne décorative sous le titre
    pdf.setDrawColor(255, 255, 0); // Jaune doré
    pdf.setLineWidth(2);
    pdf.line(width / 2 - 60, 50, width / 2 + 60, 50);
  }


  private addModernSignature(pdf: jsPDF, width: number, height: number): void {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Date d'émission
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Issued on: ${currentDate}`, width / 2, height - 40, { align: 'center' });

    // Ligne de signature moderne
    pdf.setDrawColor(255, 255, 0); // Jaune doré
    pdf.setLineWidth(1);
    pdf.line(width - 80, height - 25, width - 30, height - 25);

    // Texte de signature
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(240, 248, 255);
    pdf.text('Authorized Signature', width - 55, height - 15, { align: 'center' });

    // Ajouter un sceau moderne
    this.addModernSeal(pdf, width, height);
  }

  private addModernSeal(pdf: jsPDF, width: number, height: number): void {
    // Cercle du sceau
    pdf.setDrawColor(255, 255, 0);
    pdf.setLineWidth(2);
    pdf.circle(width - 50, height - 50, 18);

    // Étoile dans le sceau
    pdf.setFillColor(255, 255, 0);
    pdf.setFontSize(16);
    pdf.text('★', width - 50, height - 45, { align: 'center' });

    // Texte du sceau
    pdf.setFontSize(6);
    pdf.setTextColor(59, 130, 246);
    pdf.text('VERIFIED', width - 50, height - 38, { align: 'center' });
  }

  private addDecorativeBorder(pdf: jsPDF, width: number, height: number): void {
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, width - 20, height - 20);

    // Coins décoratifs
    pdf.setLineWidth(1);
    pdf.line(10, 10, 25, 10);
    pdf.line(10, 10, 10, 25);
    pdf.line(width - 10, 10, width - 25, 10);
    pdf.line(width - 10, 10, width - 10, 25);
    pdf.line(10, height - 10, 25, height - 10);
    pdf.line(10, height - 10, 10, height - 25);
    pdf.line(width - 10, height - 10, width - 25, height - 10);
    pdf.line(width - 10, height - 10, width - 10, height - 25);
  }

  private addLogo(pdf: jsPDF, width: number): void {
    // Ajouter le logo TechEvents en haut à droite
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);

    // Texte du logo
    pdf.text('TechEvents', width - 30, 25, { align: 'right' });

    // Ligne décorative sous le logo
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(1);
    pdf.line(width - 70, 30, width - 15, 30);
  }

  private addCustomLogo(pdf: jsPDF, width: number, height: number): void {
    // Logo dans le coin supérieur gauche du cadre rouge
    const logoWidth = 30;  // Taille modérée
    const logoHeight = 15; // Taille modérée
    const logoX = 25;      // Dans le cadre rouge (15mm + 10mm)
    const logoY = 25;      // Dans le cadre rouge

    try {
      // Essayer d'ajouter l'image logo.jpg directement depuis les assets
      const logoUrl = '/assets/img/logo.jpg';

      // Ajouter l'image au PDF avec gestion d'erreur
      pdf.addImage(logoUrl, 'JPEG', logoX, logoY, logoWidth, logoHeight);

    } catch (error) {
      console.warn('Erreur lors du chargement de l\'image logo.jpg, utilisation du logo textuel:', error);
      this.addTextLogoFallback(pdf, logoX, logoY, logoWidth, logoHeight);
    }
  }

  private addLargeRedBorder(pdf: jsPDF, width: number, height: number): void {
    // Grand cadre rouge autour de tout le certificat
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(4); // Épaisseur importante
    pdf.rect(15, 15, width - 30, height - 30);
  }

  private addSimpleCertificateContent(pdf: jsPDF, width: number, height: number, event: Evenement, studentName: string): void {
    // ==========================================
    // CERTIFICAT PARFAITEMENT ORGANISÉ - VERSION FINALE
    // ==========================================

    // POSITIONS RAPPROCHÉES POUR ÉVITER LA CONFUSION - ESPACES RÉDUITS
    const positions = {
      // Section 1: En-tête (Y: 25-40) - TRÈS RAPPROCHÉ
      logoY: 25,
      titleY: 40, // RAPPROCHÉ

      // Section 2: Introduction (Y: 50) - RAPPROCHÉ
      introY: 50, // RAPPROCHÉ

      // Section 3: Nom étudiant (Y: 65) - RAPPROCHÉ
      nameY: 65, // RAPPROCHÉ

      // Section 4: Certification (Y: 80) - RAPPROCHÉ
      certTextY: 80, // RAPPROCHÉ

      // Section 5: Événement (Y: 95) - RAPPROCHÉ
      eventTitleY: 95, // RAPPROCHÉ

      // Section 6: Durée (Y: 110) - RAPPROCHÉ
      durationY: 110, // RAPPROCHÉ

      // Section 7: Date completion (Y: 125) - RAPPROCHÉ
      completionDateY: 125, // RAPPROCHÉ

      // Section 8: Signature (Y: height-60 to height-20) - TRÈS RAPPROCHÉ
      issuedDateY: height - 50, // TRÈS RAPPROCHÉ
      signatureLineY: height - 35, // TRÈS RAPPROCHÉ
      signatureTextY: height - 20 // TRÈS RAPPROCHÉ
    };

    // ==========================================
    // 1. EN-TÊTE AVEC LOGO ET TITRE
    // ==========================================
    this.addPerfectHeader(pdf, width, positions);

    // ==========================================
    // 2. INTRODUCTION
    // ==========================================
    this.addPerfectIntro(pdf, width, positions);

    // ==========================================
    // 3. NOM DE L'ÉTUDIANT
    // ==========================================
    this.addPerfectStudentName(pdf, width, positions, studentName);

    // ==========================================
    // 4. TEXTE DE CERTIFICATION
    // ==========================================
    this.addPerfectCertificationText(pdf, width, positions);

    // ==========================================
    // 5. NOM DE L'ÉVÉNEMENT
    // ==========================================
    this.addPerfectEventName(pdf, width, positions, event);

    // ==========================================
    // 6. DURÉE
    // ==========================================
    this.addPerfectDuration(pdf, width, positions);

    // ==========================================
    // 7. DATE DE COMPLETION
    // ==========================================
    this.addPerfectCompletionDate(pdf, width, positions, event);

    // ==========================================
    // 8. SIGNATURE
    // ==========================================
    this.addPerfectSignature(pdf, width, height, positions);
  }

  private addPerfectHeader(pdf: jsPDF, width: number, positions: any): void {
    // Logo en haut à gauche
    this.addCustomLogo(pdf, width, 0);

    // Titre principal centré (sans ligne dessous)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('CERTIFICATE OF COMPLETION', width / 2, positions.titleY, { align: 'center' });

    // SUPPRESSION de la ligne décorative rouge sous le titre
  }

  private addPerfectIntro(pdf: jsPDF, width: number, positions: any): void {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('This certifies that', width / 2, positions.introY, { align: 'center' });
  }

  private addPerfectStudentName(pdf: jsPDF, width: number, positions: any, studentName: string): void {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(220, 38, 38); // Rouge
    pdf.text(studentName.toUpperCase(), width / 2, positions.nameY, { align: 'center' });

    // SUPPRESSION de toute ligne décorative sous le nom
  }

  private addPerfectCertificationText(pdf: jsPDF, width: number, positions: any): void {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('has successfully completed the training program', width / 2, positions.certTextY, { align: 'center' });
  }

  private addPerfectEventName(pdf: jsPDF, width: number, positions: any, event: Evenement): void {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(220, 38, 38); // Rouge
    const eventTitle = event.title.length > 50 ? event.title.substring(0, 47) + '...' : event.title;
    pdf.text(`"${eventTitle}"`, width / 2, positions.eventTitleY, { align: 'center' });
  }

  private addPerfectDuration(pdf: jsPDF, width: number, positions: any): void {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('Duration: 2 hours', width / 2, positions.durationY, { align: 'center' });
  }

  private addPerfectCompletionDate(pdf: jsPDF, width: number, positions: any, event: Evenement): void {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text(`Completion Date: ${eventDate}`, width / 2, positions.completionDateY, { align: 'center' });
  }

  private addPerfectSignature(pdf: jsPDF, width: number, height: number, positions: any): void {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // SUPPRESSION de la ligne de séparation

    // Date d'émission
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text(`Issued on: ${currentDate}`, width / 2, positions.issuedDateY, { align: 'center' });

    // SUPPRESSION de la ligne de signature

    // Texte de signature
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('Authorized Signature', width - 75, positions.signatureTextY, { align: 'center' });
  }

  private addCertificateIntroAndName(pdf: jsPDF, width: number, introY: number, nameY: number, studentName: string): void {
    // Texte d'introduction
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('This certifies that', width / 2, introY, { align: 'center' });

    // Nom de l'étudiant
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(220, 38, 38); // Rouge
    pdf.text(studentName.toUpperCase(), width / 2, nameY, { align: 'center' });
  }

  private addCertificateTextAndEvent(pdf: jsPDF, width: number, certTextY: number, eventTitleY: number, event: Evenement): void {
    // Texte de certification
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('has successfully completed the training program', width / 2, certTextY, { align: 'center' });

    // Nom de l'événement
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(220, 38, 38); // Rouge
    const eventTitle = event.title.length > 50 ? event.title.substring(0, 47) + '...' : event.title;
    pdf.text(`"${eventTitle}"`, width / 2, eventTitleY, { align: 'center' });
  }

  private addCertificateEventDetails(pdf: jsPDF, width: number, detailsStartY: number, durationY: number, completionDateY: number, event: Evenement): void {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Durée (affichée en premier, sous l'événement)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text(`Duration: 2 hours`, width / 2, durationY, { align: 'center' });

    // Date de completion (affichée en second)
    pdf.text(`Completion Date: ${eventDate}`, width / 2, completionDateY, { align: 'center' });
  }

  private addCertificateFinalSignature(pdf: jsPDF, width: number, height: number, separatorY: number, issuedDateY: number, signatureLineY: number, signatureTextY: number): void {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Ligne de séparation
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(1);
    pdf.line(width / 2 - 80, separatorY, width / 2 + 80, separatorY);

    // Date d'émission
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text(`Issued on: ${currentDate}`, width / 2, issuedDateY, { align: 'center' });

    // Ligne de signature
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(1);
    pdf.line(width - 100, signatureLineY, width - 50, signatureLineY);

    // Texte de signature
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('Authorized Signature', width - 75, signatureTextY, { align: 'center' });
  }

  private addCertificateBody(pdf: jsPDF, width: number, event: Evenement, studentName: string): void {
    // Texte d'introduction
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('This certifies that', width / 2, 90, { align: 'center' });

    // ESPACE
    pdf.setFontSize(8);
    pdf.text('', width / 2, 105, { align: 'center' });

    // Nom de l'étudiant (élément principal)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(220, 38, 38); // Rouge
    pdf.text(studentName.toUpperCase(), width / 2, 120, { align: 'center' });

    // ESPACE
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('', width / 2, 135, { align: 'center' });

    // Texte de certification
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('has successfully completed the training program', width / 2, 150, { align: 'center' });

    // ESPACE
    pdf.setFontSize(8);
    pdf.text('', width / 2, 165, { align: 'center' });

    // Nom de l'événement
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(220, 38, 38); // Rouge
    const eventTitle = event.title.length > 50 ? event.title.substring(0, 47) + '...' : event.title;
    pdf.text(`"${eventTitle}"`, width / 2, 180, { align: 'center' });
  }

  private addCertificateDetails(pdf: jsPDF, width: number, event: Evenement): void {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // ESPACE AVANT LES DÉTAILS
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text('', width / 2, 200, { align: 'center' });

    // Informations sur des lignes séparées
    pdf.setFontSize(14);
    pdf.text(`Completion Date: ${eventDate}`, width / 2, 215, { align: 'center' });

    // ESPACE
    pdf.setFontSize(8);
    pdf.text('', width / 2, 230, { align: 'center' });

    pdf.setFontSize(14);
    pdf.text(`Duration: 2 hours`, width / 2, 245, { align: 'center' });
  }

  private addCertificateSignature(pdf: jsPDF, width: number, height: number): void {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // ESPACE AVANT LA SIGNATURE
    const signatureY = height - 100;

    // Ligne de séparation
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(1);
    pdf.line(width / 2 - 80, signatureY - 10, width / 2 + 80, signatureY - 10);

    // ESPACE
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text('', width / 2, signatureY, { align: 'center' });

    // Date d'émission
    pdf.setFontSize(12);
    pdf.text(`Issued on: ${currentDate}`, width / 2, signatureY + 10, { align: 'center' });

    // ESPACE
    pdf.setFontSize(8);
    pdf.text('', width / 2, signatureY + 25, { align: 'center' });

    // Ligne de signature
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(1);
    pdf.line(width - 100, signatureY + 35, width - 50, signatureY + 35);

    // ESPACE
    pdf.setFontSize(8);
    pdf.text('', width / 2, signatureY + 45, { align: 'center' });

    // Texte de signature
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('Authorized Signature', width - 75, signatureY + 50, { align: 'center' });
  }

  private addCertificateContent(pdf: jsPDF, width: number, height: number, event: Evenement, studentName: string): void {
    // Sous-titre en noir
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('This certifies that', width / 2, 80, { align: 'center' });

    // Nom de l'étudiant en rouge
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(220, 38, 38); // Rouge
    pdf.text(studentName.toUpperCase(), width / 2, 100, { align: 'center' });

    // Texte de certification en noir
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('has successfully completed the training program', width / 2, 120, { align: 'center' });

    // Nom de l'événement en rouge
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(220, 38, 38); // Rouge
    const eventTitle = event.title.length > 60 ? event.title.substring(0, 57) + '...' : event.title;
    pdf.text(`"${eventTitle}"`, width / 2, 145, { align: 'center' });

    // Technologies (si disponible) en noir
    if (event.technologie) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0); // Noir
      pdf.text(`Specializing in: ${event.technologie}`, width / 2, 165, { align: 'center' });
    }

    // Informations de l'événement en noir
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // Noir
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Completed on: ${eventDate}`, width / 2, 185, { align: 'center' });
    pdf.text(`Duration: 2 hours`, width / 2, 195, { align: 'center' });
  }


  private addRedSeal(pdf: jsPDF, width: number, height: number): void {
    // Cercle du sceau rouge
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(2);
    pdf.circle(width - 50, height - 50, 18);

    // Étoile rouge dans le sceau
    pdf.setFillColor(220, 38, 38); // Rouge
    pdf.setFontSize(16);
    pdf.text('★', width - 50, height - 45, { align: 'center' });

    // Texte du sceau en noir
    pdf.setFontSize(6);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('VERIFIED', width - 50, height - 38, { align: 'center' });
  }

  private addTextLogoFallback(pdf: jsPDF, x: number, y: number, width: number, height: number): void {
    // Logo de secours avec texte stylisé en noir et rouge
    pdf.setFont('helvetica', 'bold');

    // Fond blanc
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y, width, height, 3, 3, 'F');

    // Bordure rouge
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(1);
    pdf.roundedRect(x, y, width, height, 3, 3, 'S');

    // Texte rouge
    pdf.setFontSize(10);
    pdf.setTextColor(220, 38, 38); // Rouge
    pdf.text('TECH EVENTS', x + width/2, y + height/2 + 2, { align: 'center' });

    // Petit indicateur en noir
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(0, 0, 0); // Noir
    pdf.text('LOGO', x + width/2, y + height - 3, { align: 'center' });
  }

  private addTextLogo(pdf: jsPDF, width: number, height: number): void {
    // Logo de secours en cas d'erreur de chargement d'image
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(59, 130, 246);
    pdf.text('TECH EVENTS', 50, 30, { align: 'center' });
  }

  private addSimpleBorder(pdf: jsPDF, width: number, height: number): void {
    // Bordure rouge élégante
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(2);
    pdf.rect(20, 20, width - 40, height - 40);

    // Coins décoratifs rouges subtils
    pdf.setDrawColor(220, 38, 38); // Rouge
    pdf.setLineWidth(1);
    pdf.line(20, 20, 35, 20);
    pdf.line(20, 20, 20, 35);
    pdf.line(width - 20, 20, width - 35, 20);
    pdf.line(width - 20, 20, width - 20, 35);
    pdf.line(20, height - 20, 35, height - 20);
    pdf.line(20, height - 20, 20, height - 35);
    pdf.line(width - 20, height - 20, width - 35, height - 20);
    pdf.line(width - 20, height - 20, width - 20, height - 35);
  }

  private addDecorativeElements(pdf: jsPDF, width: number, height: number): void {
    // Ajouter des étoiles décoratives
    pdf.setFillColor(255, 215, 0); // Gold
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);

    // Étoiles dans les coins
    pdf.text('★', 20, 30);
    pdf.text('★', width - 25, 30);
    pdf.text('★', 20, height - 25);
    pdf.text('★', width - 25, height - 25);

    // Ajouter un sceau en bas à droite
    pdf.setDrawColor(255, 215, 0);
    pdf.setLineWidth(1);
    pdf.circle(width - 40, height - 40, 15);
    pdf.setFontSize(8);
    pdf.setTextColor(255, 215, 0);
    pdf.text('VERIFIED', width - 40, height - 35, { align: 'center' });
  }

  downloadCertificate(event: Evenement, studentName: string = 'John Doe', includeBackground: boolean = false): void {
    this.generateCertificate(event, studentName, includeBackground).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${event.title.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Erreur lors du téléchargement du certificat:', error);
      alert('Erreur lors du téléchargement du certificat. Veuillez réessayer.');
    });
  }

}