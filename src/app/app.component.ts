import { Component, Inject, OnInit } from '@angular/core'
import { NotesService } from './notes.service'
import { NewNote, Note } from './note'
import { BehaviorSubject } from 'rxjs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    selected?: Note | NewNote
    notes = new BehaviorSubject<Note[]>([])
    formShow: boolean = false
    editNoteForm: FormGroup
    createNote = false
    editNote = false
    currentNote: Note = {
        id: -1,
        title: '',
        body: '',
        color: '',
        favorite: false,
    }

    constructor(
        private formBuilder: FormBuilder,
        private readonly notesService: NotesService
    ) {}

    ngOnInit() {
        this.notesService.notes$.subscribe(this.notes)
        this.editNoteForm = this.formBuilder.group({
            title: ['', Validators.required],
            body: [''],
            color: [''],
            favorite: [false],
        })
        this.notes.subscribe((values) => {
            this.selected = values[values.length - 1]
            // this.selectNote(values[values.length - 1])
        })
    }

    selectNote(note: Note) {
        // TODO: prevent changing original object
        this.selected = note
        this.editNoteForm = this.formBuilder.group({
            title: [this.selected.title, Validators.required],
            body: [this.selected.body],
            color: [this.selected.color],
            favorite: [this.selected.favorite],
        })
        this.formShow = true
    }

    newNote() {
        this.selected = createNewNote()
        this.editNoteForm = this.formBuilder.group({
            title: ['', Validators.required],
            body: [''],
            color: [''],
            favorite: [false],
        })
    }

    saveNote(event) {
        // TODO: save note
        for (let key in this.editNoteForm.controls) {
            this.selected[key] = this.editNoteForm.controls[key].value
        }
        this.notesService.saveNote(this.selected).subscribe((note) => {
            this.selected = note
            // this.selectNote(note)
            this.newNote()
        })
    }

    toggleForm() {
        this.formShow = !this.formShow
        this.newNote()
    }
}

function createNewNote(): NewNote {
    return { title: '', body: '', color: '', favorite: false }
}
