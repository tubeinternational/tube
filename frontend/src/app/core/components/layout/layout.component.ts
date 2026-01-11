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
import { AdminVideoService } from '../../../features/admin/services/admin-video.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    RouterLinkWithHref,
    RouterLink,
    CommonModule,
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

  // Dropdown state controlled by Angular bindings
  categoriesOpen = false;
  searchBarOpen = false;
  categoriesList: any[] = [];
  searchTerm = '';
  userEmail: string | null = null;
  isAdmin = false;
  private _desktopOpen = false;
  private _unlisteners: Array<() => void> = [];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService,
    private adminService: AdminVideoService
  ) {
    this.authService.user$.subscribe((user) => {
      this.userEmail = user?.email || null;
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  ngOnInit() {
    this.getCategoriesList();
  }

  logout() {
    this.authService.logout();
  }

  ngAfterViewInit(): void {
    // Menu button click
    this._unlisteners.push(
      this.renderer.listen(this.menuBtn.nativeElement, 'click', () =>
        this.onMenuClick()
      )
    );

    // Overlay click
    this._unlisteners.push(
      this.renderer.listen(this.overlay.nativeElement, 'click', () =>
        this.closeAll()
      )
    );

    // Window resize listener
    this._unlisteners.push(
      this.renderer.listen('window', 'resize', () => this.onResize())
    );

    // Click outside to close categories dropdown
    this._unlisteners.push(
      this.renderer.listen('document', 'click', (event: Event) => {
        if (!this.categoriesOpen) return;
        const target = event.target as HTMLElement;
        if (!target.closest('#catBtn') && !target.closest('#catDropdown')) {
          this.categoriesOpen = false;
        }
      })
    );

    // Click outside to close mobile search dropdown
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

    // Initialize state according to current width
    this.onResize();
  }

  // Toggle search bar dropdown (used by template binding)
  toggleSearchBar(): void {
    this.searchBarOpen = !this.searchBarOpen;
    // Focus the input when opening
    if (this.searchBarOpen) {
      setTimeout(() => {
        this.mobileSearchInput?.nativeElement.focus();
      }, 100);
    }
  }

  // Toggle categories dropdown (used by template binding)
  toggleCategories(): void {
    this.categoriesOpen = !this.categoriesOpen;
  }

  private onMenuClick(): void {
    const width = window.innerWidth;
    if (width > 1024) {
      // Desktop: toggle a CSS class to collapse sidebar (CSS controls transform & margin)
      const isCollapsed =
        this.sidebar.nativeElement.classList.toggle('collapsed');
      this._desktopOpen = !isCollapsed;
    } else {
      // Mobile: use classes with overlay
      this.sidebar.nativeElement.classList.toggle('active');
      this.overlay.nativeElement.classList.toggle('active');
    }
  }

  private closeAll(): void {
    this.sidebar.nativeElement.classList.remove('active');
    this.overlay.nativeElement.classList.remove('active');
    this.searchBarOpen = false; // Close mobile search on overlay click
    // On mobile overlay close, also ensure desktop collapsed state is not forced; keep whatever desktop state is present
    // Do not set inline transforms here — CSS classes handle desktop.
  }

  private onResize(): void {
    const width = window.innerWidth;
    if (width > 1024) {
      // Desktop: ensure overlay is hidden and remove 'active' mobile state
      this.overlay.nativeElement.classList.remove('active');
      this.sidebar.nativeElement.classList.remove('active');
      this.searchBarOpen = false; // Close mobile search on desktop
      // Remove any inline transform so CSS controls default visibility.
      this.renderer.removeStyle(this.sidebar.nativeElement, 'transform');
      // mainContainer margin is controlled by CSS (.main-container or .sidebar.collapsed + .main-container)
    } else {
      // Mobile: clear desktop-only classes so CSS handles mobile layout
      this.sidebar.nativeElement.classList.remove('collapsed');
      // Remove any inline styles to avoid conflicts
      this.renderer.removeStyle(this.sidebar.nativeElement, 'transform');
      this.renderer.removeStyle(this.mainContainer.nativeElement, 'marginLeft');
      this._desktopOpen = false;
    }
  }

  ngOnDestroy(): void {
    // remove all listeners
    this._unlisteners.forEach((un) => un());
    this._unlisteners = [];
  }

  // SEARCH

  search(): void {
    const q = this.searchTerm.trim();
    if (!q) return;

    this.router.navigate(['/home'], {
      queryParams: { q },
    });
  }

  getCategoriesList() {
    this.adminService.getCategories().subscribe({
      next: (res) => {
        this.categoriesList = res;
      },
    });
  }

  onCategorySelect(category: string) {
    this.categoriesOpen = false;

    this.router.navigate(['/'], {
      queryParams: { category },
      queryParamsHandling: 'merge', // keeps search, page, etc
    });
  }
}
