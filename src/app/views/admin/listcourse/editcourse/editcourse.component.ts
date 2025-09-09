import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService, Cours } from '../../../../services/course.service';
import { ImageUploadService } from '../../../../services/image-upload.service';

@Component({
  selector: 'app-editcourse',
  templateUrl: './editcourse.component.html',
  styleUrls: ['./editcourse.component.css']
})
export class EditcourseComponent implements OnInit {
  courseForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  courseId: number | null = null;
  course: Cours | null = null;

  // File upload properties
  selectedFiles: { [key: string]: File } = {};
  filePreviews: { [key: string]: string } = {};
  uploadProgress: { [key: string]: number } = {};

  // Allowed file types
  allowedFileTypes = {
    pdf: ['application/pdf'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    powerpoint: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  };

  maxFileSize = 50 * 1024 * 1024; // 50MB

  categories: string[] = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Security',
    'AI/ML'
  ];

  levels: string[] = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  formats: string[] = [
    'Video',
    'PDF',
    'Interactive',
    'Mixed'
  ];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private imageUploadService: ImageUploadService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.courseForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duree: [0, [Validators.required, Validators.min(1)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      niveau: ['Beginner', Validators.required],
      categorie: ['Programming', Validators.required],
      format: ['Video', Validators.required],
      fichier: [''],
      image: [''],
      video: [''],
      pdfFile: [''],
      videoFile: [''],
      powerpointFile: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      if (this.courseId) {
        this.loadCourse(this.courseId);
      }
    });
  }

  loadCourse(courseId: number): void {
    this.loading = true;
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.populateForm(course);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Erreur lors du chargement du cours';
        this.loading = false;
      }
    });
  }

  populateForm(course: Cours): void {
    this.courseForm.patchValue({
      titre: course.titre,
      description: course.description,
      duree: course.duree,
      prix: course.prix,
      niveau: course.niveau,
      categorie: course.categorie,
      format: course.format,
      fichier: course.fichier,
      image: course.image,
      video: course.video,
      pdfFile: course.pdfFile,
      videoFile: course.videoFile,
      powerpointFile: course.powerpointFile
    });

    // Set file previews if files exist
    if (course.image) {
      this.filePreviews['image'] = course.image;
    }
    if (course.pdfFile) {
      this.filePreviews['pdf'] = course.pdfFile;
    }
    if (course.videoFile) {
      this.filePreviews['video'] = course.videoFile;
    }
    if (course.powerpointFile) {
      this.filePreviews['powerpoint'] = course.powerpointFile;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      const control = this.courseForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} est requis`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} doit être supérieur à ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/admin/listcourse']);
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  // File upload methods
  onFileSelected(event: any, fileType: string): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.isValidFileType(file, fileType)) {
        this.error = `Type de fichier non valide pour ${fileType}. Types autorisés: ${this.getAllowedExtensions(fileType).join(', ')}`;
        return;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        this.error = `Le fichier est trop volumineux. Taille maximale: ${this.maxFileSize / (1024 * 1024)}MB`;
        return;
      }

      this.selectedFiles[fileType] = file;
      this.createFilePreview(file, fileType);
      this.clearMessages();
    }
  }

  private isValidFileType(file: File, fileType: string): boolean {
    const allowedTypes = this.allowedFileTypes[fileType as keyof typeof this.allowedFileTypes];
    return allowedTypes ? allowedTypes.includes(file.type) : true;
  }

  private getAllowedExtensions(fileType: string): string[] {
    const typeMap: { [key: string]: string[] } = {
      pdf: ['.pdf'],
      video: ['.mp4', '.avi', '.mov', '.wmv'],
      powerpoint: ['.ppt', '.pptx'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    };
    return typeMap[fileType] || [];
  }

  private createFilePreview(file: File, fileType: string): void {
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreviews[fileType] = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, just store the file name
      this.filePreviews[fileType] = file.name;
    }
  }

  removeFile(fileType: string): void {
    delete this.selectedFiles[fileType];
    delete this.filePreviews[fileType];
  }

  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      pdf: 'fas fa-file-pdf',
      video: 'fas fa-file-video',
      powerpoint: 'fas fa-file-powerpoint',
      image: 'fas fa-file-image'
    };
    return iconMap[fileType] || 'fas fa-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Updated submit method to handle file uploads and course update
  onSubmit(): void {
    if (this.courseForm.valid && this.courseId) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const courseData: Cours = {
        ...this.courseForm.value,
        idCours: this.courseId,
        nb_etudiantsEnrolled: this.course?.nb_etudiantsEnrolled || 0,
        rating: this.course?.rating || 0.0,
        date_publication: this.course?.date_publication || new Date().toISOString().split('T')[0],
        addedByAdmin: true
      };

      // First upload files, then update course
      this.uploadFiles().subscribe({
        next: (uploadedFiles) => {
          // Update course data with uploaded file URLs
          Object.assign(courseData, uploadedFiles);

          // Update the course
          this.courseService.updateCourse(courseData).subscribe({
            next: (response) => {
              this.loading = false;
              this.success = 'Cours modifié avec succès!';
              setTimeout(() => {
                this.router.navigate(['/admin/listcourse']);
              }, 2000);
            },
            error: (error) => {
              console.error('Error updating course:', error);
              this.loading = false;
              this.error = 'Erreur lors de la modification du cours. Veuillez réessayer.';
            }
          });
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.loading = false;
          this.error = 'Erreur lors du téléchargement des fichiers.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private uploadFiles() {
    const uploadPromises: Promise<any>[] = [];

    Object.keys(this.selectedFiles).forEach(fileType => {
      const file = this.selectedFiles[fileType];
      if (file) {
        // Use uploadImage for all file types (it should work for any file)
        const uploadPromise = this.imageUploadService.uploadImage(file).toPromise();
        uploadPromises.push(uploadPromise);
      }
    });

    return {
      subscribe: (callbacks: { next: (result: any) => void, error: (error: any) => void }) => {
        if (uploadPromises.length === 0) {
          callbacks.next({});
          return;
        }

        Promise.all(uploadPromises)
          .then(results => {
            const uploadedFiles: { [key: string]: string } = {};
            Object.keys(this.selectedFiles).forEach((fileType, index) => {
              // Extract URL from the response
              const result = results[index];
              if (result && result.body && result.body.imageUrl) {
                uploadedFiles[fileType] = result.body.imageUrl;
              } else if (result && result.imageUrl) {
                uploadedFiles[fileType] = result.imageUrl;
              }
            });
            callbacks.next(uploadedFiles);
          })
          .catch(error => {
            callbacks.error(error);
          });
      }
    };
  }

  // Getter for template access to Object.keys
  get selectedFileTypes(): string[] {
    return Object.keys(this.selectedFiles);
  }

  // Getter for checking if any files are selected
  get hasSelectedFiles(): boolean {
    return this.selectedFileTypes.length > 0;
  }
}
