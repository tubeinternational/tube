import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    RouterLinkWithHref,
    RouterLink,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('menuBtn', { static: true }) menuBtn!: ElementRef<HTMLElement>;
  @ViewChild('sidebar', { static: true }) sidebar!: ElementRef<HTMLElement>;
  @ViewChild('overlay', { static: true }) overlay!: ElementRef<HTMLElement>;
  @ViewChild('mainContainer', { static: true })
  mainContainer!: ElementRef<HTMLElement>;
  @ViewChild('mobileSearchInput', { static: false })
  mobileSearchInput!: ElementRef<HTMLInputElement>;

  searchBarOpen = false;
  searchTerm = '';
  userEmail: string | null = null;
  isAdmin = false;

  private _desktopOpen = false;
  private _unlisteners: Array<() => void> = [];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.user$.subscribe((user) => {
      this.userEmail = user?.email || null;
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  logout() {
    this.authService.logout();
  }

  ngAfterViewInit(): void {
    this._unlisteners.push(
      this.renderer.listen(this.menuBtn.nativeElement, 'click', () =>
        this.onMenuClick()
      )
    );

    this._unlisteners.push(
      this.renderer.listen(this.overlay.nativeElement, 'click', () =>
        this.closeAll()
      )
    );

    this._unlisteners.push(
      this.renderer.listen('window', 'resize', () => this.onResize())
    );

    this._unlisteners.push(
      this.renderer.listen('document', 'click', (event: Event) => {
        if (!this.searchBarOpen) return;
        const target = event.target as HTMLElement;
        if (
          !target.closest('.mobile-search-dropdown') &&
          !target.closest('.mobile-search-btn')
        ) {
          this.searchBarOpen = false;
        }
      })
    );

    this.onResize();
  }

  toggleSearchBar(): void {
    this.searchBarOpen = !this.searchBarOpen;
    if (this.searchBarOpen) {
      setTimeout(() => {
        this.mobileSearchInput?.nativeElement.focus();
      }, 100);
    }
  }

  private onMenuClick(): void {
    const width = window.innerWidth;
    if (width > 1024) {
      const isCollapsed =
        this.sidebar.nativeElement.classList.toggle('collapsed');
      this._desktopOpen = !isCollapsed;
    } else {
      this.sidebar.nativeElement.classList.toggle('active');
      this.overlay.nativeElement.classList.toggle('active');
    }
  }

  private closeAll(): void {
    this.sidebar.nativeElement.classList.remove('active');
    this.overlay.nativeElement.classList.remove('active');
    this.searchBarOpen = false;
  }

  private onResize(): void {
    const width = window.innerWidth;
    if (width > 1024) {
      this.overlay.nativeElement.classList.remove('active');
      this.sidebar.nativeElement.classList.remove('active');
      this.searchBarOpen = false;
      this.renderer.removeStyle(this.sidebar.nativeElement, 'transform');
    } else {
      this.sidebar.nativeElement.classList.remove('collapsed');
      this.renderer.removeStyle(this.sidebar.nativeElement, 'transform');
      this.renderer.removeStyle(this.mainContainer.nativeElement, 'marginLeft');
      this._desktopOpen = false;
    }
  }

  ngOnDestroy(): void {
    this._unlisteners.forEach((un) => un());
    this._unlisteners = [];
  }

  // 🔍 SEARCH
  search(): void {
    const q = this.searchTerm.trim();
    if (!q) return;

    this.router.navigate(['/home'], {
      queryParams: { q },
      queryParamsHandling: 'merge',
    });
  }
}
