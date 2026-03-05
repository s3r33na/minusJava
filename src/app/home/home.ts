import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'; // <-- New Import
import { SplitText } from 'gsap/SplitText'; // <-- New Import
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);
gsap.registerPlugin(ScrollToPlugin);
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('mainEl', { static: true }) mainEl!: ElementRef<HTMLElement>;
  @ViewChild('debrisCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('logoText', { static: true }) logoTextRef!: ElementRef<HTMLElement>;
  activeCardRect: DOMRect | null = null;
  activeCardEl: HTMLElement | null = null;
  isModalOpen = false;
  activeProject: any = null;
activeFaqIndex: number | null = 0; // The first item is open by default
  // This holds the detailed content for your specific projects
  projectsData: Record<string, any> = {
    aura: {
      title: 'Aura Menu',
      category: 'Digital Platform',
      // We break the description into 3 distinct parts:
      overview:
        'Aura revolutionizes the dining experience with an interactive, highly responsive digital menu. Built with Angular 21, TypeScript, and signals for state management, it provides a seamless and premium UI/UX for cafes and restaurants.',
      features:
        'The platform features real-time updates, intuitive navigation, and a visually stunning interface that elevates customer engagement and streamlines ordering processes.',
      vision:
        'I built this to create a modern, scalable solution for the food service industry. By taking the rich, warm, and inviting aesthetic of coffee culture, Aura delivers a digital experience that feels just as comforting and engaging as a visit to your favorite cafe.',
      tech: ['Angular 21', 'TypeScript', 'Tailwind', 'GSAP'],
      link: 'View Live App',
      url: 'https://s3r33na.github.io/brewCoffee-menu/',
    },
    transport: {
      title: 'Transport Tracking',
      category: 'Cloud Architecture',
      description:
        'A highly scalable cloud-native architecture designed on AWS to track and manage university transportation. Utilizes ECS Fargate for container orchestration and Redis pub/sub for real-time WebSocket communication.',
      tech: ['AWS ECS', 'Redis', 'WebSockets', 'Cloud-native'],
      link: 'View Architecture',
      url: '#',
    },
    ordering: {
      title: 'QR Ordering System',
      category: 'POS Integration',
      overview:
        "A seamless table-side ordering experience for restaurants and cafes. Customers scan a table-specific QR code to browse the digital menu, customize their selection, and place orders that instantly sync to the restaurant's central POS machine.",
      features:
        'Reduces wait times, increases order accuracy, and provides actionable analytics for restaurant managers.',
      vision:
        'To bridge the gap between physical dining and digital convenience without losing the human touch of hospitality.',
      tech: ['Angular', 'Node.js', 'WebSockets', 'POS API'],
      link: 'View Live App',
      url: '#',
    },
    backend: {
      title: 'Browser App & API',
      category: 'ASP.NET Backend',
      description:
        'A custom browser extension backed by a robust ASP.NET infrastructure. Integrated with Microsoft SQL Server for secure, reliable data processing and user management.',
      tech: ['ASP.NET', 'MS SQL Server', 'C#', 'Browser Extension'],
      link: 'View Repository',
      url: '#',
    },
  };
faqs = [
    {
      question: 'How long until my project goes live?',
      answer: 'We understand that speed is a competitive advantage. For a standard website or automation, our average delivery time is 4 weeks. For complex custom systems, we establish a clear roadmap from day one: you\'ll see progress through iterative steps, ensuring transparency without the wait.'
    },
    {
      question: "I'm not a tech expert, will I be able to manage the site?",
      answer: 'Absolutely. Our goal is to empower you. We don\'t just hand over code; we provide an intuitive control panel and personalized training. If you can navigate an email inbox, you can manage our tools.'
    },
    {
      question: 'Are the costs fixed or will there be surprises?',
      answer: 'We value transparency as much as you do. Before we begin, you\'ll receive a detailed, fixed-price quote. That price is final. If you choose to expand the scope later, we\'ll discuss and quote those additions separately. Clear terms, long-term partnerships.'
    },
    {
      question: 'Do you provide support after the project is delivered?',
      answer: 'Yes. True partnership means we don\'t disappear after launch. We offer ongoing maintenance, scaling, and tech-support packages to ensure your platform grows with your business.'
    },
    {
      question: 'My company is small—is automation really worth it?',
      answer: 'Automation is for anyone looking to stop wasting time on repetitive tasks like data entry or invoicing. SMEs often see the greatest impact: by recovering just one hour a day, the investment typically pays for itself within months.'
    },
    {
      question: 'Is Data Certification and Smart Contract tech complicated to use?',
      answer: 'The complexity is under the hood—and we handle that. For you, it\'s seamless. We integrate blockchain solutions to ensure data security and traceability without changing how you work. It\'s a powerful trust-builder for your brand and your clients.'
    }
  ];
  private onMoveHandler?: (e: PointerEvent) => void;
  private onLeaveHandler?: () => void;

  // Handlers for the infinite scroll snapping
  private snapResizeHandler?: () => void;
  private snapScrollHandler?: (e: Event) => void;

  scrollProgress = 0;
  lastScrollY = 0;
  isNavHidden = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;

    if (scrollPosition > this.lastScrollY && scrollPosition > 100) {
      this.isNavHidden = true;
    } else {
      this.isNavHidden = false;
    }
    this.lastScrollY = scrollPosition;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      this.scrollProgress = (scrollPosition / maxScroll) * 100;
    } else {
      this.scrollProgress = 0;
    }
  }

  ngAfterViewInit(): void {
    this.resizeAndDraw();
    this.initParallax();
    this.initTextAnimations(); // <-- Add this here
    this.initCardHoverEffects(); // <-- Add it here!
    this.initGlowCards(); // <-- And here!
    this.initLevitateCards(); // <-- And here!
    this.initBentoGrid(); // <-- And here!
    this.initTeamAnimation(); // <-- And here!
    this.initContactAnimation(); // <-- Add this!
    // this.initScrambleText(); // <-- Call the new function
    // this.initSnappingPanels(); // <-- Initialize the new scroll logic
  }

  private initParallax(): void {
    const canvas = this.canvasRef.nativeElement;
    const textEl = this.logoTextRef.nativeElement;

    gsap.set(canvas, { transformStyle: 'preserve-3d', z: -50, scale: 1.1 });
    gsap.set(textEl, { transformStyle: 'preserve-3d', z: 80 });

    this.onMoveHandler = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      gsap.to(canvas, {
        x: nx * 15,
        y: ny * 15,
        rotationY: nx * 8,
        rotationX: -ny * 8,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.to(textEl, {
        x: nx * -10,
        y: ny * -10,
        rotationY: nx * 12,
        rotationX: -ny * 12,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    this.onLeaveHandler = () => {
      gsap.to([canvas, textEl], {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
        overwrite: 'auto',
      });
    };

    window.addEventListener('pointermove', this.onMoveHandler);
    window.addEventListener('pointerleave', this.onLeaveHandler);
  }

  private initSnappingPanels(): void {
    const panels = gsap.utils.toArray('.panel') as HTMLElement[];
    if (panels.length === 0) return;

    // 1. Pin each panel so they stack on top of each other
    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        pin: true,
        // pinSpacing: false makes the next section slide OVER the current one
        pinSpacing: false,
      });
    });

    // 2. Add a global snap so it locks into the closest section cleanly
    ScrollTrigger.create({
      snap: {
        // This calculates the snap points based on how many panels you have
        snapTo: 1 / (panels.length - 1),
        duration: { min: 0.2, max: 0.6 }, // How fast it snaps
        delay: 0.1, // Wait a tiny fraction of a second after the user stops scrolling
        ease: 'power2.inOut',
      },
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.resizeAndDraw();
  }

  ngOnDestroy(): void {
    if (this.onMoveHandler && this.onLeaveHandler) {
      window.removeEventListener('pointermove', this.onMoveHandler);
      window.removeEventListener('pointerleave', this.onLeaveHandler);
    }

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
  private resizeAndDraw(): void {
    const canvas = this.canvasRef.nativeElement;
    const outer = this.mainEl.nativeElement.querySelector('.logo-outer') as HTMLElement | null;

    const w = outer?.clientWidth ?? window.innerWidth;
    const h = outer?.clientHeight ?? window.innerHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.drawDebris(canvas);
  }

  private drawDebris(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    const colors = [
      '#8b2f32',
      '#a6a19b',
      '#dca725',
      '#523424',
      '#1f2528',
      '#4b554e',
      '#1e3a5f',
      '#2b4f81',
      '#4b2f6b',
      '#5e3c8c',
    ];

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let x = 0; x < w; x += 30) for (let y = 0; y < h; y += 30) ctx.fillRect(x, y, 2, 2);

    for (let i = 0; i < 75; i++) {
      ctx.fillStyle = colors[(Math.random() * colors.length) | 0];
      ctx.beginPath();
      const sx = Math.random() * w,
        sy = Math.random() * h;
      ctx.moveTo(sx, sy);

      const points = ((Math.random() * 4) | 0) + 3;
      const size = Math.random() * 22 + 6;
      for (let p = 0; p < points; p++)
        ctx.lineTo(sx + (Math.random() - 0.5) * size, sy + (Math.random() - 0.5) * size);

      ctx.closePath();
      ctx.fill();
    }
  }
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);

    if (element) {
      this.isNavHidden = false;

      gsap.to(window, {
        duration: 1.2,
        scrollTo: {
          y: element,
          autoKill: false,
          offsetY: 0,
        },
        ease: 'power4.inOut',
      });
    } else {
      console.error(`Could not find section with ID: ${sectionId}`);
    }
  }
  private initScrambleText(): void {
    // 1. Grab all the elements we just added the class to
    const scrambleElements = gsap.utils.toArray('.scramble') as HTMLElement[];
    if (scrambleElements.length === 0) return;

    // 2. Loop through each element to apply the scroll trigger
    scrambleElements.forEach((el) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%', // Triggers when the text is 15% up from the bottom of the screen
          toggleActions: 'play none none none', // Plays once. Change to "play none none reset" if you want it to scramble every time you scroll up and down
        },
        duration: 1.5,
        scrambleText: {
          text: '{original}', // Reads what is already in the HTML and scrambles to it
          chars: 'lowerCase', // You can change this to "01" for a matrix effect, or "XO" etc.
          revealDelay: 0.1, // Adds a slight delay before it starts forming real words
          tweenLength: false,
        },
        ease: 'power2.out',
      });
    });
  }
  private initTextAnimations(): void {
    // 1. Animate Headings (Word by Word Reveal)
    const headings = gsap.utils.toArray('.split-heading') as HTMLElement[];

    headings.forEach((heading) => {
      // Break the heading into words
      const split = new SplitText(heading, { type: 'words' });

      gsap.from(split.words, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%', // Trigger when it enters the viewport
          toggleActions: 'play none none reverse', // Animates in, and reverses when you scroll away
        },
        y: 40, // Drops them down slightly
        opacity: 0, // Fades them in
        duration: 0.8,
        stagger: 0.04, // Delays each word slightly for a cascading effect
        ease: 'back.out(1.4)', // Gives it a tiny, satisfying bounce at the end
      });
    });

    // 2. Animate Paragraphs (Line by Line Reveal)
    const bodyTexts = gsap.utils.toArray('.split-body') as HTMLElement[];

    bodyTexts.forEach((body) => {
      // Break the paragraphs into lines
      const split = new SplitText(body, { type: 'lines' });

      gsap.from(split.lines, {
        scrollTrigger: {
          trigger: body,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1, // Slightly slower stagger for lines
        ease: 'power3.out',
      });
    });
  }

  private initCardHoverEffects(): void {
    const cards = gsap.utils.toArray('.gsap-card') as HTMLElement[];

    cards.forEach((card) => {
      // Find the SVG inside the card so we can give it a parallax effect
      const icon = card.querySelector('svg');

      // 1. When the mouse moves OVER the card
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to the center of the card (-1 to 1)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Tilt the card
        gsap.to(card, {
          rotationY: x * 15, // Max 15 degree tilt
          rotationX: -y * 15,
          y: -8, // Lift up slightly
          scale: 1.02,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000, // Required for 3D effect
          transformOrigin: 'center',
        });

        // Parallax the icon inside
        if (icon) {
          gsap.to(icon, {
            x: x * 20,
            y: y * 20,
            duration: 0.4,
            ease: 'power2.out',
          });
        }
      });

      // 2. When the mouse LEAVES the card
      card.addEventListener('mouseleave', () => {
        // Snap everything back to normal with a satisfying spring effect
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'elastic.out(1, 0.4)', // Bouncy return
        });

        if (icon) {
          gsap.to(icon, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' });
        }
      });
    });
  }
  private initGlowCards(): void {
    const glowCards = gsap.utils.toArray('.gsap-glow-card') as HTMLElement[];

    glowCards.forEach((card) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Pass the exact mouse pixels to the CSS variables
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
  private initLevitateCards(): void {
    const levitateCards = gsap.utils.toArray('.gsap-levitate-card') as HTMLElement[];

    levitateCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8, // Smooth lift up
          boxShadow: '0px 20px 40px rgba(194, 149, 236, 0.12)', // Soft purple glow below
          borderColor: 'rgba(194, 149, 236, 0.3)', // Light up the border
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0px 0px 0px rgba(194, 149, 236, 0)',
          borderColor: 'rgba(255, 255, 255, 0.05)', // Back to default white/5
          duration: 0.6,
          ease: 'power2.out',
        });
      });
    });
  }
  private initBentoGrid(): void {
    const bentoItems = gsap.utils.toArray('.bento-item') as HTMLElement[];
    if (bentoItems.length === 0) return;

    gsap.from(bentoItems, {
      scrollTrigger: {
        trigger: bentoItems[0].closest('.panel'), // Triggers when the Projects section comes into view
        start: 'top 40%', // Starts slightly before it locks in
        toggleActions: 'play none none reverse', // Plays on scroll down, reverses on scroll up
      },
      y: 120, // Fly up from below
      scale: 0.85, // Start slightly smaller
      opacity: 0,
      duration: 1,
      stagger: 0.15, // Delays each box so they assemble in a sequence
      ease: 'back.out(1.2)', // Satisfying bounce effect as they lock into the grid
    });
  }
  openProject(projectId: string, cardEl: HTMLElement): void {
    if (this.isModalOpen) return;
    this.isModalOpen = true;
    this.activeProject = this.projectsData[projectId];
    this.activeCardEl = cardEl;

    // 1. Get exact position of the clicked card on the screen
    this.activeCardRect = cardEl.getBoundingClientRect();

    const modal = document.querySelector('.project-modal') as HTMLElement;
    const modalBg = document.querySelector('.project-modal-bg') as HTMLElement;
    const modalContent = document.querySelector('.project-modal-content') as HTMLElement;

    // Lock the background scrolling
    document.body.style.overflow = 'hidden';

    // 2. Setup the modal to perfectly match the card's current shape and position
    gsap.set(modal, { display: 'block', zIndex: 9999 });
    gsap.set(modalBg, {
      top: this.activeCardRect.top,
      left: this.activeCardRect.left,
      width: this.activeCardRect.width,
      height: this.activeCardRect.height,
      borderRadius: '24px',
      backgroundColor: '#161311', // Matches the card background
    });
    gsap.set(modalContent, { opacity: 0, y: 30 });

    // 3. The FLIP Animation
    const tl = gsap.timeline();

    // Hide the original card so it looks like it popped out of the grid
    gsap.to(cardEl, { opacity: 0, duration: 0.1 });

    // Expand the modal to full screen
    tl.to(modalBg, {
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: '0px',
      duration: 0.6,
      ease: 'power3.inOut',
    })
      // Fade in the rich project details
      .to(
        modalContent,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        '-=0.2',
      ); // Overlap the animations slightly
  }

  closeProject(): void {
    if (!this.activeCardRect || !this.activeCardEl) return;

    const modalBg = document.querySelector('.project-modal-bg') as HTMLElement;
    const modalContent = document.querySelector('.project-modal-content') as HTMLElement;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set('.project-modal', { display: 'none' });
        this.isModalOpen = false;
        document.body.style.overflow = ''; // Unlock scrolling
      },
    });

    // Fade out text, then shrink the background back to the exact card coordinates
    tl.to(modalContent, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' })
      .to(modalBg, {
        top: this.activeCardRect.top,
        left: this.activeCardRect.left,
        width: this.activeCardRect.width,
        height: this.activeCardRect.height,
        borderRadius: '24px',
        duration: 0.6,
        ease: 'power3.inOut',
      })
      // Turn the original card back on
      .to(this.activeCardEl, { opacity: 1, duration: 0.2 }, '-=0.2');
  }
  private initTeamAnimation(): void {
    const teamSection = document.querySelector('#team');
    if (!teamSection) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: teamSection,
        start: 'top 60%', // Trigger when the section is 60% down the screen
        toggleActions: 'play none none reverse',
      },
    });

    // 1. Pop the avatars in
    tl.from('.team-node', {
      scale: 0,
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.2, // One after the other
      ease: 'back.out(1.5)',
    })
      // 2. Fade in the connecting lines
      .from(
        '.team-line',
        {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        },
        '-=0.2',
      ) // Overlap slightly with the avatars
      // 3. Bounce the Team pill in the center
      .from(
        '.team-pill',
        {
          scale: 0.5,
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'elastic.out(1.2, 0.4)', // Very satisfying, rubber-band bounce
        },
        '-=0.2',
      );
  }
toggleFaq(index: number): void {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }
  private initContactAnimation(): void {
    const contactSection = document.querySelector('#contact');
    if (!contactSection) return;

    // 1. Scramble Text Effect on the colored words
    const scrambleElements = gsap.utils.toArray('.scramble-target') as HTMLElement[];
    
    scrambleElements.forEach((el) => {
      // Clear the text initially so it's blank before the animation starts
      const originalText = el.getAttribute('data-text') || '';
      el.innerText = ''; 

      gsap.to(el, {
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 70%', // Start scrambling as soon as the footer enters the viewport
          toggleActions: 'play none none none' // Play once and stay decoded
        },
        duration: 1.5, // How long the hacking effect lasts
        scrambleText: {
          text: originalText,
          chars: "lowerCase", // You can use "upperAndLowerCase" or "10" for binary
          revealDelay: 0.2, // Waits slightly before revealing the actual letters
          tweenLength: false,
          speed: 0.8
        },
        ease: "power2.out"
      });
    });

    // 2. Fade the form in gracefully
    gsap.from('form', {
      scrollTrigger: {
        trigger: contactSection,
        start: 'top 60%',
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  }
}
