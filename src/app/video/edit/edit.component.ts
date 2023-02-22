import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import IClip from '../../../models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from '../../services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  inSubmission = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Updating Clip';

  clipID = new FormControl('', {
    nonNullable: true,
  });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  });

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.activeClip) {
      return;
    }
    this.clipID.setValue(<string>this.activeClip.docID);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy() {
    this.modal.unregister('editClip');
  }

  async submit() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Updating Clip';
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later';
      return;
    }
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
}
