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
    const element = document.getElementById('pdf-content');
    
    // Options for html2pdf
    const opt = {
        margin:       [5, 5, 5, 5], // T, R, B, L
        filename:     'KIAS-Bestillingsskjema.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, logging: false, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' }
    };

    // Use html2pdf to generate the PDF
    // We need to ensure inputs are captured correctly
    // html2pdf usually captures the DOM state, but let's double check if we need to set value attribute for inputs
    
    // Helper to sync input values to DOM attributes for printing
    const inputs = element.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (input.checked) {
                input.setAttribute('checked', 'checked');
            } else {
                input.removeAttribute('checked');
            }
        } else if (input.type === 'text' || input.type === 'email' || input.type === 'number') {
            input.setAttribute('value', input.value);
        } else if (input.tagName === 'TEXTAREA') {
            input.innerHTML = input.value;
        }
    });

    // Temporarily force text color to black and background to white for PDF generation
    const originalColor = element.style.color;
    const originalBg = element.style.background;
    
    element.style.color = '#000000';
    element.style.background = '#ffffff';
    
    // Helper to force all children to have black text
    const allChildren = element.querySelectorAll('*');
    allChildren.forEach(child => {
        child.dataset.originalColor = child.style.color || '';
        child.style.color = '#000000';
        
        // Handle border colors too
        child.dataset.originalBorderColor = child.style.borderColor || '';
        if (getComputedStyle(child).borderColor !== 'rgba(0, 0, 0, 0)') {
            child.style.borderColor = '#000000';
        }
    });
    
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore styles after save
        element.style.color = originalColor;
        element.style.background = originalBg;
        
        allChildren.forEach(child => {
            child.style.color = child.dataset.originalColor;
            if (child.dataset.originalBorderColor) {
                child.style.borderColor = child.dataset.originalBorderColor;
            }
        });
    });
}
