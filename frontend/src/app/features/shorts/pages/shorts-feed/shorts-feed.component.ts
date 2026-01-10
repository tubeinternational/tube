import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  ElementRef,
} from '@angular/core';
import { ShortsFeedService } from '../../services/shorts-feed.service';
import { Video } from '../../../videos/models/video.model';
import { ShortsActionsComponent } from '../../components/shorts-actions/shorts-actions.component';
import { ShortsPlayerComponent } from '../../components/shorts-player/shorts-player.component';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../../videos/services/video.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-shorts-feed',
  standalone: true,
  templateUrl: './shorts-feed.component.html',
  styleUrls: ['./shorts-feed.component.scss'],
  imports: [ShortsActionsComponent, ShortsPlayerComponent, CommonModule],
})
export class ShortsFeedComponent implements OnInit, AfterViewInit {
  shorts: Video[] = [];
  page = 1;
  loading = false;
  hasMore = true;
  muted = true;

  activeIndex = 0;

  private observer!: IntersectionObserver;
  private viewed = new Set<string>();

  @ViewChildren('shortEl') shortElements!: QueryList<ElementRef>;

  constructor(
    private shortsService: ShortsFeedService,
    private videoService: VideoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.loadShortBySlug(slug);
    } else {
      this.loadShorts();
    }
  }

  ngAfterViewInit(): void {
    this.setupObserver();

    // ✅ THIS IS THE MISSING PIECE
    this.shortElements.changes.subscribe(() => {
      this.observeShorts();
    });
  }

  loadShorts() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;

    this.shortsService.getShorts(this.page).subscribe({
      next: (res) => {
        this.shorts.push(...res.items);
        this.hasMore = res.hasMore;
        this.page++;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private loadShortBySlug(slug: string) {
    this.loading = true;

    this.shortsService.getShortBySlug(slug).subscribe({
      next: (video) => {
        this.shorts = [video];
        this.activeIndex = 0;
        this.loading = false;
        this.loadShorts();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /** =========================
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

  /** =========================
   * ACTIVE SHORT HANDLER
   * ========================= */
  setActive(index: number) {
    this.activeIndex = index;

    const video = this.shorts[index];
    if (!video) return;

    // 🔁 Update URL without reload
    if (video.slug) {
      this.router.navigate(['/shorts', video.slug], { replaceUrl: true });
    }

    // 👁️ View count once per session
    if (!this.viewed.has(video.id)) {
      this.viewed.add(video.id);
      this.incrementView(video.id);
    }

    // 🚀 Prefetch more
    if (index >= this.shorts.length - 3) {
      this.loadShorts();
    }
  }

  private incrementView(videoId: string) {
    this.videoService.incrementViews(videoId).subscribe();
  }

  onLike(video: Video) {
    if (video.is_liked) return;

    this.shortsService.like(video.id).subscribe((res) => {
      video.is_liked = true;
      video.likes_count = res.likes_count;
    });
  }
}
