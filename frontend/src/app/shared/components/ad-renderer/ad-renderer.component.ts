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

type RenderStrategy = 'HTML' | 'IFRAME' | 'SCRIPT_SAFE' | 'SCRIPT_SANDBOX';

@Component({
  selector: 'app-ad-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ad-container"
      #containerRef
      [attr.data-placement]="placement || 'unknown'"
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

  // ✅ prevent duplicate script loading
  private loadedScripts = new Set<string>();

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
  // MAIN RENDER ENGINE
  // =========================
  private renderAds() {
    const container = this.containerRef.nativeElement;
    container.innerHTML = '';

    if (!this.ads || this.ads.length === 0) return;

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
          this.renderScriptDirect(wrapper, ad.code);
          break;
      }

      container.appendChild(wrapper);
    });

    this.triggerAdRefresh();
  }

  // =========================
  // 🧠 DETECTION ENGINE
  // =========================
  private detectStrategy(ad: Ad): RenderStrategy {
    const code = (ad.code || '').toLowerCase();

    if (ad.type === 'HTML') return 'HTML';
    if (ad.type === 'IFRAME') return 'IFRAME';

    const dangerousPatterns = [
      'document.write',
      'document.body',
      'window.open',
      'popunder',
      'eval(',
      'atob(',
      'settimeout(',
      'setinterval(',
      'createelement("script")',
      'insertbefore',
    ];

    if (dangerousPatterns.some((p) => code.includes(p))) {
      return 'SCRIPT_SANDBOX';
    }

    const safePatterns = ['adsbygoogle', 'googletag', 'adsbyjuicy', '<ins'];

    if (safePatterns.some((p) => code.includes(p))) {
      return 'SCRIPT_SAFE';
    }

    return 'SCRIPT_SANDBOX';
  }

  // =========================
  // CLEAN SCRIPT (CDATA FIX)
  // =========================
  private cleanScript(code: string): string {
    return (
      code
        // remove ALL CDATA wrappers (robust)
        .replace(/\/\s*<!\[CDATA\[\s*\//g, '')
        .replace(/\/\s*\]\]>\s*\//g, '')
        .replace(/<!\[CDATA\[/g, '')
        .replace(/\]\]>/g, '')

        // remove leading malformed regex-like patterns
        .replace(/^\/+/g, '')

        // remove stray comment endings
        .replace(/\*\/\s*$/g, '')
    );
  }

  private normalizeScript(code: string): string {
    if (!code) return '';

    let cleaned = code;

    // Remove CDATA wrappers safely
    cleaned = cleaned
      .replace(/<!\[CDATA\[/gi, '')
      .replace(/\]\]>/gi, '')

      // Remove weird wrapped comment patterns
      .replace(/\/\s*<!\[CDATA\[\s*\//gi, '')
      .replace(/\/\s*\]\]>\s*\//gi, '')

      // Remove leading/trailing junk slashes/comments
      .replace(/^\/+/, '')
      .replace(/\*\/\s*$/, '');

    return cleaned.trim();
  }

  // =========================
  // SCRIPT DIRECT (SAFE)
  // =========================
  private renderScriptDirect(wrapper: HTMLElement, code: string) {
    const temp = document.createElement('div');
    temp.innerHTML = code;

    const scripts: HTMLScriptElement[] = [];

    temp.querySelectorAll('script').forEach((s) => {
      scripts.push(s);
      s.remove();
    });

    // Inject HTML (like <ins>)
    wrapper.appendChild(temp);

    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');

      // Copy attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (oldScript.src) {
        if (!document.querySelector(`script[src="${oldScript.src}"]`)) {
          newScript.src = oldScript.src;
          newScript.async = true;
          document.body.appendChild(newScript);
        }
      } else {
        try {
          newScript.text = oldScript.innerHTML;
          wrapper.appendChild(newScript);
        } catch (e) {
          console.warn('Inline ad script failed:', e);
        }
      }
    });
  }

  private triggerAdRefresh() {
    setTimeout(() => {
      try {
        if ((window as any).adsbyjuicy) {
          (window as any).adsbyjuicy.push({});
          console.log('✅ JuicyAds refresh triggered');
        }
      } catch (e) {
        console.warn('❌ Ad refresh failed', e);
      }
    }, 150);
  }

  // =========================
  // SCRIPT SANDBOX (SAFE MODE)
  // =========================
  private renderScriptSafe(wrapper: HTMLElement, code: string) {
    const iframe = document.createElement('iframe');

    iframe.className = 'ad-iframe';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '250px';

    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups',
    );

    const cleanedCode = this.cleanScript(code);

    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body style="margin:0;padding:0;">
          ${cleanedCode}
        </body>
      </html>
    `;

    wrapper.appendChild(iframe);
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
  // IFRAME ADS
  // =========================
  private renderIframe(wrapper: HTMLElement, code: string) {
    const iframe = document.createElement('iframe');
    iframe.className = 'ad-iframe';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '250px';
    iframe.srcdoc = code;
    wrapper.appendChild(iframe);
  }
}
