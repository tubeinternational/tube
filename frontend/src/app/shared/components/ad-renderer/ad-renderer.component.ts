import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ad } from '../../../features/manage-ads/models/manage-ads.model';

@Component({
  selector: 'app-ad-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ad-container"
      #containerRef
      [attr.data-placement]="placement"
    ></div>
  `,
  styleUrls: ['./ad-renderer.component.scss'],
})
export class AdRendererComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() ads: Ad[] = [];
  @Input() placement: string = '';

  @ViewChild('containerRef', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  private observer!: IntersectionObserver;
  private hasRendered = false;

  ngAfterViewInit(): void {
    this.setupLazyLoad();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ads'] && this.hasRendered) {
      this.renderAds();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
  }

  // =========================
  // LAZY LOAD
  // =========================
  private setupLazyLoad() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.hasRendered) {
          this.renderAds();
          this.hasRendered = true;
          this.observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    this.observer.observe(this.containerRef.nativeElement);
  }

  // =========================
  // MAIN RENDER
  // =========================
  private renderAds() {
    const container = this.containerRef.nativeElement;
    container.innerHTML = '';

    if (!this.ads || this.ads.length === 0) return;

    // Sort by priority
    const sortedAds = [...this.ads].sort((a, b) => b.priority - a.priority);

    sortedAds.forEach((ad) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ad-wrapper';

      switch (ad.type) {
        case 'HTML':
          this.renderHTML(wrapper, ad.code);
          break;

        case 'IFRAME':
          this.renderIframe(wrapper, ad.code);
          break;

        case 'SCRIPT':
        default:
          this.renderScriptSafe(wrapper, ad.code);
          break;
      }

      container.appendChild(wrapper);
    });
  }

  // =========================
  // HTML ADS
  // =========================
  private renderHTML(wrapper: HTMLElement, code: string) {
    const div = document.createElement('div');
    div.className = 'ad-html';
    div.innerHTML = code;
    wrapper.appendChild(div);
  }

  // =========================
  // IFRAME ADS (SAFE)
  // =========================
  private renderIframe(wrapper: HTMLElement, code: string) {
    const iframe = document.createElement('iframe');
    iframe.className = 'ad-iframe';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.srcdoc = code;
    wrapper.appendChild(iframe);
  }

  // =========================
  // SCRIPT ADS (FORCED SAFE)
  // =========================
  private renderScriptSafe(wrapper: HTMLElement, code: string) {
    // 🚨 Always sandbox script ads
    const iframe = document.createElement('iframe');
    iframe.className = 'ad-iframe';
    iframe.style.width = '100%';
    iframe.style.border = 'none';

    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body style="margin:0;padding:0;">
          ${code}
        </body>
      </html>
    `;

    wrapper.appendChild(iframe);
  }
}
