import { TestBed, fakeAsync, ComponentFixture, inject, waitForAsync } from '@angular/core/testing';
import { AppComponent } from '../app/app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Note } from '../app/note';
import { NotesService } from '../app/notes.service';
import {initialNotes} from '../app/notes.fixture';
import {Page} from './page';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  }));

  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let notes: Note[] = [];
  let page: Page;

  beforeEach(waitForAsync(inject([NotesService], (mockService) => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;

    notes = initialNotes;

    page = new Page(fixture);
  })));

  it('should show empty form when new note is created', fakeAsync(() => {
    page.createNewNote();
    expect(page.getNoteForm()).toBeTruthy('Expected to find form when new note is created');
  }));

  it('should list all notes', waitForAsync(inject([NotesService], () => {
    expect(page.getListNotes().length).toEqual(initialNotes.length, '.note elements displayed does not match notes list');
  })));

  it('should select note when clicked (add `active` class)', fakeAsync(inject([NotesService], (mockService) => {
    const note = page.selectListNote();
    expect(note.nativeElement.classList).toContain('active', 'Selected note element should have class `active`');
  })));

  it('should populate inputs with selected note`s title and text', fakeAsync(() => {
    const index = 1;
    page.selectListNote(index);
    const formData = page.getFormData(['title', 'body', 'color']);
    const note = notes[index];
    expect(formData['title']).toEqual(note['title'], 'Title field doesn`t reflect selected note');
    expect(formData['body']).toEqual(note['body'], 'Body field doesn`t reflect selected note');
    expect(formData['color']).toEqual(note['color'], 'Color field doesn`t reflect selected note');
  }));

  it('should save note when Save button is clicked', fakeAsync(() => {
    page.createNewNote();
    page.fillNoteForm({ title: 'Lorem ipsum' });
    spyOn(component, 'saveNote');
    page.saveNoteForm();
    expect(component.saveNote).toHaveBeenCalled();
  }));

  it('should save note using NoteService when form is submitted', fakeAsync(inject([NotesService], (mockService) => {
    spyOn(mockService, 'saveNote');
    mockService.saveNote.and.callFake((note) => of(note));
    component.saveNote(notes[1]);
    expect(mockService.saveNote).toHaveBeenCalledWith(notes[1]);
  })));

  it('should disable save button when required fields are empty', fakeAsync(() => {
    page.selectListNote();
    const titleField = page.getFormField('title');
    expect(titleField.nativeElement.attributes['required']).toBeDefined(' missing `required` attribute on title input');
    page.fillNoteForm({ title: '' });
    expect(page.getSaveBtn().nativeElement.disabled).toBeTruthy('Save button should be disabled on form errors');
  }));

  it('should remove field`s error message when field has no errors', fakeAsync(() => {
    page.selectListNote();
    const titleField = page.getFormField('title');
    expect(titleField.nativeElement.attributes['required']).toBeDefined(' missing `required` attribute on title input');

    let formError = titleField.nativeElement.parentElement.parentElement.querySelector('.form-error');
    expect(formError && formError.offsetParent).toBeFalsy('There should be no error when field is valid');

    page.fillNoteForm({ title: '' });

    formError = titleField.nativeElement.parentElement.parentElement.querySelector('.form-error');
    expect(formError && formError.offsetParent).toBeTruthy('There should be error when field is invalid');
  }));

  // Saving copy
  it('should not change note on list until its saved', fakeAsync(inject([NotesService], (mockService) => {
    const index = 1;
    page.selectListNote(index);
    const changedValue = 'Lorem ipsum';

    page.fillNoteForm({
      title: changedValue
    });

    const formData = page.getFormData(['title', 'body']);
    expect(formData['title']).toEqual(changedValue);

    const list = page.getListNotes();
    expect(list[index].nativeElement.textContent).not.toContain(changedValue, 'List should not be updated before save button is pressed');
  })));

  it('should keep note selected after its saved', fakeAsync(() => {
    page.selectListNote(2);

    const formData = {
      title: 'Lorem ipsum',
      body: 'dolor sit amet',
    };

    page.fillNoteForm(formData);
    page.saveNoteForm();

    const note = page.selectListNote(2);
    expect(note.nativeElement.classList).toContain('active', 'After note is saved it should be selected on the list');
    expect(note.nativeElement.textContent).toContain(formData.title, 'After note is saved it should be selected on the list');
  }));

  // favorite Notes
  it('should make note list item font 20px when note is favorite', fakeAsync(() => {
    let note = page.selectListNote(1);
    page.fillNoteForm({
      favorite: true
    });
    page.saveNoteForm();
    note = page.selectListNote(1);
    expect(window.getComputedStyle(note.nativeElement).fontSize).toBe('20px', 'When note is marked favorite its font size should be 20px');
  }));

  // Notes Colors
  it('should set font color on the list item note`s color', fakeAsync(() => {
    let note = page.selectListNote(1);
    page.fillNoteForm({
      color: '#00ff00'
    });
    page.saveNoteForm();
    note = page.selectListNote(1);
    expect(note.nativeElement.style.color).toBe('rgb(0, 255, 0)', 'Note font color should match note.color value');
  }));
  it('should have the newly created note to be selected', fakeAsync(() => {
    // 3 notes initially
    expect(page.getListNotes().length).toBe(3);

    page.createNewNote();
    page.fillNoteForm({
      title: 'new Note'
    });

    page.saveNoteForm();
    // now we have 4 notes and the newly created note should be selected
    expect(page.getListNotes().length).toBe(4);

    page.fillNoteForm({
      title: 'adjusted new Note'
    });
    page.saveNoteForm();

    // Since the newly create note should be automatically selected,
    // changing the title should adjust this note and NOT create a new one
    expect(page.getListNotes().length).toBe(4);
  }));

});
