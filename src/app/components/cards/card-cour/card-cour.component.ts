import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpResponse } from '@angular/common/http'; 
import { Cours } from 'src/app/core/models/Cours';
import { CoursService } from 'src/app/core/service/cours.service';
import { NotificationService } from 'src/app/core/service/notification.service';

@Component({
  selector: "app-card-cour",
  templateUrl: "./card-cour.component.html",
})
export class CardCourComponent implements OnInit {
  coursList: Cours[] = [];
  filteredCourses: Cours[] = [];
  imageFile: File | null = null;
  fichierFile: File | null = null;
  videoFile: File | null = null;
  searchQuery: string = '';
  sortType: number = 0; // Track sorting type: 0 for name, 1 for date, 2 for category
  sortButtonText: string = "Sort by Name"; // Initial button text

  showForm = false;
  isDownloading: boolean = false;
  formMode: 'add' | 'edit' = 'add';
  newCour: Cours = {
    id_cours: 0,
    titre: '',
    description: '',
    duree: 0,
    prix: 0,
    niveau: '',
    categorie: '',
    date_publication: new Date(),
    nb_etudiantsEnrolled: 0,
    rating: 0,
    format: '',
    fichier: '',
    image: '',
    video: ''
  };

  @Input()
  get color(): string {
    return this._color;
  }
  set color(color: string) {
    this._color = color !== "light" && color !== "dark" ? "light" : color;
  }
  private _color = "light";

  constructor(private coursService: CoursService,
    private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadCours();
  }
  loadCours() {
    this.coursService.getCoursList().subscribe({
      next: (data) => {
        this.coursList = data;
        this.filteredCourses = data;
      },
      error: (error) => {
        console.error('Error fetching cours:', error);
      },
    });
  }
  showAddForm() {
    this.resetForm();
    this.formMode = 'add';
    this.showForm = true;
  }
  addCour() {
    
    if (!this.imageFile) {
      console.error('No image selected');
      return;
    }
    this.coursService.addCours(this.newCour, this.imageFile, this.fichierFile, this.videoFile).subscribe({
      next: () => {
        this.showForm = false;
        this.loadCours(); 
        this.resetForm();
        this.notificationService.showSuccess('The course has been added successfully');
      },
      error: (error) => {
        console.error('Error adding course:', error);
      },
    });
  }
  resetForm() {
    this.newCour = {
      id_cours: 0,
      titre: '',
      description: '',
      duree: 0,
      prix: 0,
      niveau: '',
      categorie: '',
      date_publication: new Date(),
      nb_etudiantsEnrolled: 0,
      rating: 0,
      format: '',
      fichier: '',
      image: '',
      video: ''
    };
  }
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      // Optional: Preview the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCour.image = e.target.result; // Base64 preview (not saved to DB)
      };
      reader.readAsDataURL(file);
    }
  }
  
  onFileSelected(event: any,type: 'fichier' | 'video') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'fichier') {
        this.fichierFile = file;
        this.newCour.fichier = file.name;
    } else {
        this.videoFile = file;
        this.newCour.video = file.name;
    } // Adjust as needed for backend upload
    }
  }
  deleteCour(id: number) {
    this.coursService.deleteCours(id).subscribe({
      next: () => {
        this.coursList = this.coursList.filter(cours => cours.id_cours !== id);
        console.log(`Course with ID ${id} deleted successfully.`);
      },
      error: (error) => {
        console.error('Error deleting course:', error);
      }
    });
  }
  editCour(cours: Cours) {
    
    this.newCour = { ...cours };
    this.formMode = 'edit';
    this.showForm = true;
  }
  updateCour() {
    this.coursService.updateCours(this.newCour).subscribe({
      next: () => {
        this.showForm = false;
        this.loadCours();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error updating course:', error);
      },
    });
  }
  searchCours() {
    this.filteredCourses = this.coursList.filter(cours =>
      cours.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      cours.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      cours.niveau.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  downloadPDF() {
    this.isDownloading = true;
    this.coursService.downloadPdf().subscribe(
        (response: HttpResponse<Blob>) => {
            const blob = new Blob([response.body!], { type: 'application/pdf' });
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition?.split('filename=')[1] || 'courses.pdf';
            
            // For IE/Edge
            if ((window.navigator as any).msSaveOrOpenBlob) {
              (window.navigator as any).msSaveOrOpenBlob(blob, filename);
            } else {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            this.isDownloading = false;
        },
        error => {
            console.error('Download error:', error);
            this.isDownloading = false;
            // Show error message to user
        }
    );
}
sortCours() {
  if (this.sortType === 0) {
    // Sort by Name
    this.filteredCourses.sort((a, b) => a.titre.localeCompare(b.titre));
    this.sortType = 1;
    this.sortButtonText = "Sort by Date";
  } else if (this.sortType === 1) {
    // Sort by Date
    this.filteredCourses.sort((a, b) => {
      const dateA = new Date(a.date_publication).getTime();
      const dateB = new Date(b.date_publication).getTime();
      return dateA - dateB; // Sort by date ascending
    });
    this.sortType = 2;
    this.sortButtonText = "Sort by Category";
  } else if (this.sortType === 2) {
    // Sort by Category
    this.filteredCourses.sort((a, b) => a.categorie.localeCompare(b.categorie));
    this.sortType = 0;
    this.sortButtonText = "Sort by Name";
  }
}
  
}
