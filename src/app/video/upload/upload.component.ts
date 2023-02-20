import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from '../../services/clip.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  isDragOver = false;
  file: File | null = null;
  nextStep = false;
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({
    title: this.title,
  });
  showAlert = false;
  alertMsg = 'Please wait, your video is being uploaded.';
  alertColor = 'blue';
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService
  ) {
    // user will never be null because of route guards
    auth.user.subscribe((user) => (this.user = user));
  }

  storeFile($event: Event) {
    this.isDragOver = false;
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
    console.log(this.file);
  }

  uploadFile() {
    this.showAlert = true;
    this.alertMsg = 'Please wait, your account is being created.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    this.showPercentage = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    try {
      const task = this.storage.upload(clipPath, this.file);
      const clipRef = this.storage.ref(clipPath);

      task.percentageChanges().subscribe((progress) => {
        this.percentage = (progress as number) / 100;
      });
      // We are using the last() method to grab the last snapshotChange which is always either going to be the success or failure of the upload
      task
        .snapshotChanges()
        .pipe(
          last(),
          switchMap(() => clipRef.getDownloadURL())
        )
        .subscribe({
          next: (url) => {
            const clip = {
              uid: this.user?.uid as string,
              displayName: this.user?.displayName as string,
              title: this.title.value,
              fileName: `${clipFileName}.mp4`,
              url,
            };
            this.clipsService.createClip(clip);
            this.alertColor = 'green';
            this.alertMsg = 'Success! Your clip is now ready to share.';
            this.showPercentage = false;
          },
          error: (error) => {
            this.alertColor = 'red';
            this.alertMsg = 'Upload failed! Please try again later.';
            this.inSubmission = true;
            this.showPercentage = false;
            console.error(error);
          },
        });
    } catch (e) {
      console.error(e);
      this.alertMsg = 'An unexpected error occurred. Please try again later';
      this.alertColor = 'red';
      return;
    }
    this.alertMsg = 'Success! Your video has been uploaded.';
    this.alertColor = 'green';
  }
}
