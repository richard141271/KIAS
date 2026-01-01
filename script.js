document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Use requestAnimationFrame for smoother class toggling
                requestAnimationFrame(() => {
                    entry.target.classList.add('active');
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // 2. Smooth Scrolling is now handled by CSS (html { scroll-behavior: smooth; })
    // Removed JS implementation to prevent conflicts and improve performance.

    // 3. Optimized Parallax Effect on Hero
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');

    if (hero && heroBg) {
        let ticking = false;

        hero.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const x = e.clientX / window.innerWidth;
                    const y = e.clientY / window.innerHeight;
                    
                    // Move background slightly opposite to mouse
                    // translate3d forces hardware acceleration
                    heroBg.style.transform = `translate3d(-${x * 20}px, -${y * 20}px, 0)`;
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }
});

// PDF Generation Function
function generatePDF() {
    const originalElement = document.getElementById('pdf-content');
    
    // Create a clone to manipulate for PDF generation
    const clone = originalElement.cloneNode(true);
    
    // Add the print-specific class
    clone.classList.add('pdf-export-style');
    
    // Explicitly set overlay styles to ensure visibility for html2canvas
    Object.assign(clone.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '210mm',
        zIndex: '999999',
        background: '#ffffff',
        color: '#000000',
        display: 'block',
        visibility: 'visible'
    });

    // Sync values from original to clone (cloneNode doesn't copy current input values)
    const originalInputs = originalElement.querySelectorAll('input, textarea');
    const cloneInputs = clone.querySelectorAll('input, textarea');
    
    originalInputs.forEach((input, index) => {
        const cloneInput = cloneInputs[index];
        
        if (input.type === 'checkbox' || input.type === 'radio') {
            cloneInput.checked = input.checked;
            if (input.checked) {
                cloneInput.setAttribute('checked', 'checked');
            }
        } else if (input.tagName === 'TEXTAREA') {
            cloneInput.innerHTML = input.value;
            cloneInput.value = input.value;
        } else {
            cloneInput.setAttribute('value', input.value);
            cloneInput.value = input.value;
        }
    });
    
    // Append clone to body so html2pdf can render it
    document.body.appendChild(clone);
    
    // Save current scroll position and scroll to top
    // html2canvas works best when scrolled to top
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Options for html2pdf
    const opt = {
        margin:       0, // Margins handled by CSS padding
        filename:     'KIAS-Bestillingsskjema.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            logging: false, 
            useCORS: true, 
            scrollY: 0,
            windowWidth: 1000 // Simulate desktop width to prevent mobile layout wrapping
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
        // Remove the clone after generation
        document.body.removeChild(clone);
        // Restore scroll position
        window.scrollTo(0, originalScrollY);
    });
}
