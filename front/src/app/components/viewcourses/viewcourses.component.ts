import { Component, OnInit } from '@angular/core';

import { ProfileService } from './../../services/profile.service';
import { StoreService } from './../../services/store.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { InstructorService } from '../../services/instructor-service.service';

@Component({
  selector: 'app-viewcourses',
  templateUrl: './viewcourses.component.html',
  styleUrls: ['./viewcourses.component.css'],
})
export class ViewcoursesComponent implements OnInit {
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  page = 1;
  count = 0;
  query: string = '';
  file: any;

  tableSize = 4;
  courses: any = [];
  ready: Boolean = false;
  paypal: boolean = false;
  selectedCourse: any;
  lib: any = [];
  currentIndex: any;
  isUserUndefined: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private storeService: StoreService,
    private router: Router,
    private profileService: ProfileService,
    private instructorService: InstructorService
  ) {}

  ngOnInit() {
    if (Object.keys(this.user).length === 0) {
      this.isUserUndefined = true;
    }
    this.getAllcourses();
    if (this.user.role === 'student') {
      for (var ele of this.user.library) {
        this.lib.push(ele._id);
      }
    }
  }
  getAllcourses() {
    this.storeService.getService().subscribe((res) => {
      this.courses = res;
      this.courses = this.courses
        .map((course: any) => {
          var sum = 0;
          course.rates.map((rate: any) => {
            sum = sum + rate.rates;
          });
          course['averagerate'] = sum / course.rates.length.toFixed(2);
          return course;
        })
        .sort(function (a: any, b: any) {
          return b.averagerate - a.averagerate;
        });
    });
  }
  getReady() {
    this.ready = true;
  }

  getCourse(id: any) {
    this.router.navigate(['/coursedetails', id]).then(() => {
      window.location.reload();
    });
  }

  addToLibrary(course: any) {
    this.lib.push(course._id);
    this.user.library.push(course);
    console.log(this.lib);
    localStorage.setItem('user', JSON.stringify(this.user));
    this.profileService
      .update(this.user._id, { library: this.lib })
      .subscribe();
  }

  switchPaypal(id: any) {
    this.router.navigate(['/paypal', id]).then(() => {
      location.reload();
    });
  }

  Logout() {
    localStorage.clear();
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.getAllcourses();
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.getAllcourses();
  }
  getresult(query: any) {
    this.router.navigate(['/result', query]);
  }
  getfile(f: any) {
    console.log(f);
    this.file = '';
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(
      'assets/uploads/courses/' + f
    );
  }
}
