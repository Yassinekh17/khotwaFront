import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';



export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
 
  private systemPrompt = `You are a helpful assistant specializing in web development education. 
  Your primary role is to provide information about web development courses, 
  suggest learning paths, and offer resources for people interested in learning web development. 
  Be concise, friendly, and informative.`;

  constructor(private http: HttpClient) {
    
      dangerouslyAllowBrowser: true // Note: In production, you should use a backend proxy
    };
  }
