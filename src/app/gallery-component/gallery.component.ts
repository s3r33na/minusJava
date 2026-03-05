import { 
  Component, 
  AfterViewInit, 
  ViewChild, 
  ElementRef, 
  OnDestroy, 
  NgZone, 
  ViewChildren, 
  QueryList 
} from '@angular/core';

import { gsap } from 'gsap';
import { ScrollTrigger, Flip } from 'gsap/all';

// 🚨 REQUIRES CLUB GSAP PREMIUM LICENSE
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register all three plugins
gsap.registerPlugin(ScrollTrigger, Flip, ScrambleTextPlugin);

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('galleryWrap', { static: true }) wrapper!: ElementRef;
  @ViewChild('introContainer', { static: true }) introContainer!: ElementRef;
  @ViewChild('footerWrap', { static: true }) footerWrap!: ElementRef;
  @ViewChildren('scrambleTarget') scrambleTargets!: QueryList<ElementRef>;
  
  private ctx!: gsap.Context;

  images = [
    'PIC/1.jpeg', 'PIC/4.jpeg', 'PIC/8.jpeg', 'PIC/3.jpeg',
    'PIC/5.jpeg', 'PIC/2.jpeg', 'PIC/7.jpeg', 'PIC/6.jpeg',
  ];
  
  introWords = "We are minusJava, a modern technology agency specializing in premium full-stack solutions. We engineer scalable web applications and interactive digital platforms that elevate your business.".split(" ");

  portfolioCards = [
    {
      title: 'Aura Platform',
      content: 'Our flagship interactive digital menu system, built for modern cafes and restaurants to streamline ordering and customer experience.',
      isFlipped: false
    },
    {
      title: 'Custom Web Solutions',
      content: 'Tailored full-stack applications utilizing Angular and robust .NET architecture, designed for enterprise-level performance and scale.',
      isFlipped: false
    },
    {
      title: 'Digital Real Estate',
      content: 'A dedicated team delivering high-end UI/UX experiences, reliable modern hosting, and complete technology solutions for growing brands.',
      isFlipped: false
    }
  ];

  // Injected ElementRef to scope the context to the entire component
  constructor(private zone: NgZone, private el: ElementRef) {}

  ngAfterViewInit() {
    // Run outside Angular to prevent performance lag
    this.zone.runOutsideAngular(() => {
      // Wait for images to load, THEN create all tweens at once
      this.waitForImagesToLoad().then(() => {
        this.createTween();
      });
    });
  }

  private waitForImagesToLoad(): Promise<void> {
    return new Promise((resolve) => {
      const images = Array.from(this.wrapper.nativeElement.querySelectorAll('img')) as HTMLImageElement[];
      let loaded = 0;

      if (images.length === 0) return resolve();

      images.forEach((img) => {
        if (img.complete) {
          loaded++;
          if (loaded === images.length) resolve();
        } else {
          img.addEventListener('load', () => {
            loaded++;
            if (loaded === images.length) resolve();
          });
          img.addEventListener('error', () => {
            loaded++;
            if (loaded === images.length) resolve();
          });
        }
      });
    });
  }

  createTween() {
    const galleryElement = this.wrapper.nativeElement.querySelector('#gallery-8');
    const galleryItems = galleryElement.querySelectorAll('.gallery__item');

    // Create ONE unified context for the whole component
    this.ctx = gsap.context(() => {
      
      // --- 1. THE GALLERY BENTO ANIMATION ---
      galleryElement.classList.add('gallery--final');
      const state = Flip.getState(galleryItems);
      galleryElement.classList.remove('gallery--final');

      const flip = Flip.to(state, {
        ease: 'none',
        absolute: true,
        scale: true,
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: this.wrapper.nativeElement,
          start: 'center center',
          end: '+=150%',
          scrub: true,
          pin: true,
        },
      }).add(flip);

      // --- 2. THE INTRO TEXT REVEAL ---
      if (this.introContainer) {
        gsap.from(this.introContainer.nativeElement.querySelectorAll('.word'), {
          scrollTrigger: {
            trigger: this.introContainer.nativeElement,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          y: 30,
          opacity: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: "power2.out"
        });
      }

      // --- 3. THE FOOTER SCRAMBLE ---
      this.scrambleTargets.forEach((target) => {
        const el = target.nativeElement;
        const finalString = el.innerText;
        
        el.innerText = ""; // Clear text initially

        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 95%",
            toggleActions: "play none none none"
          },
          duration: 2,
          scrambleText: {
            text: finalString, 
            chars: "01XO-/>_{}[]", 
            revealDelay: 0.2, 
            speed: 0.5 
          }
        });
      });

    }, this.el.nativeElement); // Scoped to the entire component
  }

  ngOnDestroy(): void {
    // Cleanly removes everything (Gallery, Intro, and Footer animations)
    this.ctx?.revert();
  }

  flipCard(index: number, cardElement: HTMLElement) {
    const card = this.portfolioCards[index];
    card.isFlipped = !card.isFlipped;

    gsap.to(cardElement, {
      rotationY: card.isFlipped ? 180 : 0,
      duration: 0.8,
      ease: "back.out(1.5)"
    });
  }
}