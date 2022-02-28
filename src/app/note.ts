export interface Note {
  id: number;
  title: string;
  body: string;
  color: string;
  favorite: boolean;
}

// New note does not have ID yet
export type NewNote = Omit<Note, 'id'>;

export function isNote(note: Note|NewNote): note is Note {
  return (note as Note).id != null;
}
