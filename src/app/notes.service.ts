import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap} from 'rxjs/operators';
import { NewNote, Note, isNote } from './note';
import { initialNotes } from './notes.fixture';

@Injectable({providedIn: 'root'})
export class NotesService {
  private currentId = 1234;
  private readonly notesSubject$ = new BehaviorSubject<Note[]>(initialNotes);

  readonly notes$ = this.notesSubject$.asObservable();

  saveNote(note: Note|NewNote): Observable<Note> {
    let updatedNotes: Note[];
    let updatedNote: Note;

    // the case of a new Note.
    if (!isNote(note)) {
      updatedNote = {...note, id: this.generateId()};
      updatedNotes = [...this.notesSubject$.getValue(), updatedNote];

    } else {
      updatedNote = note;
    // Modifying existing Note
    updatedNotes = this.notesSubject$.getValue().map(n => {
      // Replace the existing Note with a new one
      if (n.id === note.id) {
        return note;
      }
      return n;
    });
  }
  return of(updatedNote).pipe(
    tap(() => {
      this.notesSubject$.next(updatedNotes);
    })
  );
  }

  private generateId() {
    return this.currentId++;
  }
}
