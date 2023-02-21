import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ClipService} from "../../services/clip.service";

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort == '2' ? params.sort : '1';
    });
    this.clipService.getUserClips().subscribe()
  }

  sort(event: Event) {
    const {value} = event.target as HTMLSelectElement;

    // both of these lines of code accomplish the same thing, navigate can do more
    // this.router.navigateByUrl(`/manage?sort=${value}`);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }
}
