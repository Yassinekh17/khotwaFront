import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // Ensure apiUrl is defined
    if (!environment.apiUrl) {
      console.warn('API URL not defined in environment, falling back to development mode');
      this.apiUrl = 'http://localhost:8089/upload';
    } else {
      this.apiUrl = `${environment.apiUrl}/upload`;
    }
  }

  // Upload an image file and return the URL from the server
  uploadImage(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.apiUrl}/image`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req).pipe(
      // If the request fails, automatically fallback to mock
      catchError(error => {
        console.warn('Real image upload failed, using mock fallback:', error);
        return this.createMockUpload(file);
      })
    );
  }

  // Fallback method for development/testing when backend is not available
  private createMockUpload(file: File): Observable<any> {
    console.log('Using local storage image upload service (fallback)');

    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;

        // Generate a unique filename
        const timestamp = Date.now();
        const fileName = `event_image_${timestamp}_${file.name}`;
        const imageUrl = `/assets/images/${fileName}`;

        try {
          // Store image data in localStorage with the generated URL as key
          localStorage.setItem(`image_${fileName}`, imageData);

          // Store mapping for retrieval
          const imageMappings = JSON.parse(localStorage.getItem('image_mappings') || '{}');
          imageMappings[imageUrl] = `image_${fileName}`;
          localStorage.setItem('image_mappings', JSON.stringify(imageMappings));

          // Simulate network delay
          setTimeout(() => {
            // Create a mock HTTP response
            const response = new HttpResponse({
              body: { imageUrl, message: 'Image uploaded successfully (local storage)' },
              status: 200
            });

            // Emit the response
            observer.next({ type: 4, body: { imageUrl } });
            observer.complete();
          }, 500); // 0.5 second delay
        } catch (error) {
          observer.error(new Error('Failed to store image in local storage: ' + error));
        }
      };
      reader.onerror = error => {
        observer.error(new Error('Failed to read file: ' + error));
      };
      reader.readAsDataURL(file);
    });
  }

  // Method to retrieve stored image data
  getStoredImage(imageUrl: string): string | null {
    try {
      console.log('🔍 Recherche d\'image stockée pour URL:', imageUrl);
      const imageMappings = JSON.parse(localStorage.getItem('image_mappings') || '{}');
      console.log('📋 Mappings d\'images disponibles:', imageMappings);

      const storageKey = imageMappings[imageUrl];
      if (storageKey) {
        console.log('✅ Clé de stockage trouvée:', storageKey);
        const imageData = localStorage.getItem(storageKey);
        console.log('🖼️ Données d\'image récupérées:', imageData ? 'Oui' : 'Non');
        return imageData;
      } else {
        console.log('❌ Aucune clé de stockage trouvée pour cette URL');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'image stockée:', error);
    }
    return null;
  }

  // Method to get image source (handles both stored images and regular URLs)
  getImageSource(imageUrl: string): string {
    console.log('🎯 getImageSource appelée avec URL:', imageUrl);

    if (!imageUrl) {
      console.log('⚠️ Aucune URL fournie, utilisation de l\'image par défaut');
      return 'assets/img/landing.jpg'; // Default image
    }

    // Check if it's a stored image
    if (imageUrl.startsWith('/assets/images/')) {
      console.log('📁 URL détectée comme image stockée');
      const storedImage = this.getStoredImage(imageUrl);
      if (storedImage) {
        console.log('✅ Image stockée trouvée, retour de la data URL');
        return storedImage;
      } else {
        console.log('❌ Image stockée non trouvée, utilisation de l\'image par défaut');
        return 'assets/img/landing.jpg';
      }
    }

    // Return the URL as-is for external images
    console.log('🌐 URL externe détectée, retour tel quel:', imageUrl);
    return imageUrl;
  }

  // Debug method to inspect localStorage content
  debugLocalStorage(): void {
    console.log('🔍 === DEBUG LOCALSTORAGE ===');
    try {
      const mappings = localStorage.getItem('image_mappings');
      console.log('📋 Image mappings:', mappings);

      if (mappings) {
        const parsedMappings = JSON.parse(mappings);
        console.log('🔗 URLs mappées:', Object.keys(parsedMappings));

        for (const [url, key] of Object.entries(parsedMappings)) {
          const data = localStorage.getItem(key as string);
          console.log(`🖼️ ${url} -> ${key}: ${data ? 'Présent (' + data.length + ' chars)' : 'Absent'}`);
        }
      }

      // Check for any image_ keys
      const imageKeys = Object.keys(localStorage).filter(key => key.startsWith('image_'));
      console.log('🗝️ Clés d\'images trouvées:', imageKeys);
    } catch (error) {
      console.error('❌ Erreur lors du debug localStorage:', error);
    }
    console.log('🔍 === FIN DEBUG ===');
  }
}
