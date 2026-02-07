import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  QueryList,
  ViewChildren,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ShortsFeedService } from '../../services/shorts-feed.service';
import { VideoService } from '../../../videos/services/video.service';
import { Video } from '../../../videos/models/video.model';

import { ShortsActionsComponent } from '../../components/shorts-actions/shorts-actions.component';
import { ShortsPlayerComponent } from '../../components/shorts-player/shorts-player.component';

@Component({
  selector: 'app-shorts-feed',
  standalone: true,
  templateUrl: './shorts-feed.component.html',
  styleUrls: ['./shorts-feed.component.scss'],
  imports: [CommonModule, ShortsActionsComponent, ShortsPlayerComponent],
})
export class ShortsFeedComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  shorts: Video[] = [];
  page = 1;
  loading = false;
  hasMore = true;
  muted = true;

  activeIndex = 0;
  expandedIndex: number | null = null;

  private observer!: IntersectionObserver;
  private viewed = new Set<string>();
  private initialSlug?: string;

  @ViewChildren('shortEl') shortElements!: QueryList<ElementRef>;

  constructor(
    private shortsService: ShortsFeedService,
    private videoService: VideoService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2
  ) {}

  /* =========================
   * INIT / DESTROY
   * ========================= */
  ngOnInit(): void {
    // Lock layout scrolling
    this.renderer.addClass(document.body, 'shorts-page');

    const slug = this.route.snapshot.paramMap.get('slug');
    this.initialSlug = slug || undefined;

    if (slug) {
      this.loadShortBySlug(slug);
    } else {
      this.loadShorts();
    }
  }

  ngAfterViewInit(): void {
    this.setupObserver();
    this.shortElements.changes.subscribe(() => this.observeShorts());
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'shorts-page');
    if (this.observer) this.observer.disconnect();
  }

  /* =========================
   * DATA LOADING
   * ========================= */
  loadShorts() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;

    this.shortsService.getShorts(this.page).subscribe({
      next: (res) => {
        const filtered = this.initialSlug
          ? res.items.filter((v) => v.slug !== this.initialSlug)
          : res.items;

        this.shorts.push(...filtered);
        this.hasMore = res.hasMore;
        this.page++;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private loadShortBySlug(slug: string) {
    this.loading = true;

    this.shortsService.getShortBySlug(slug).subscribe({
      next: (video) => {
        this.shorts = [video];
        this.activeIndex = 0;
        this.page = 1;
        this.loading = false;
        this.loadShorts();
      },
      error: () => (this.loading = false),
    });
  }

  /* =========================
   * INTERSECTION OBSERVER
   * ========================= */
  private setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const index = this.shortElements
          .toArray()
          .findIndex((el) => el.nativeElement === visible.target);

        if (index !== -1 && index !== this.activeIndex) {
          this.setActive(index);
        }
      },
      { threshold: 0.6 }
    );
  }

  private observeShorts() {
    this.shortElements.forEach((el) =>
      this.observer.observe(el.nativeElement)
    );
  }

  /* =========================
   * ACTIVE SHORT
   * ========================= */
  setActive(index: number) {
    this.activeIndex = index;
    this.expandedIndex = null;

    const video = this.shorts[index];
    if (!video) return;

    if (video.slug) {
      this.router.navigate(['/shorts', video.slug], { replaceUrl: true });
    }

    if (!this.viewed.has(video.id)) {
      this.viewed.add(video.id);
      this.videoService.incrementViews(video.id).subscribe();
    }

    if (index >= this.shorts.length - 3) {
      this.loadShorts();
    }
  }

  /* =========================
   * UI ACTIONS
   * ========================= */
  toggleDescription(index: number, event: Event) {
    event.stopPropagation();
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  onLike(video: Video) {
    if (video.is_liked) return;

    this.shortsService.like(video.id).subscribe((res) => {
      video.is_liked = true;
      video.likes_count = res.likes_count;
    });
  }
}
