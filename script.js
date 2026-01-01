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
    
    // Create a wrapper to isolate the PDF content
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: 'auto',
        minHeight: '100vh',
        zIndex: '9999999',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px'
    });

    // Create a clone
    const clone = originalElement.cloneNode(true);
    
    // Add the print-specific class
    clone.classList.add('pdf-export-style');
    
    // Force styles on clone to ensure it looks like a document
    Object.assign(clone.style, {
        position: 'relative',
        width: '210mm',
        minHeight: '297mm',
        boxShadow: 'none',
        margin: '0',
        transform: 'none',
        opacity: '1',
        visibility: 'visible',
        display: 'block',
        backgroundColor: '#ffffff',
        color: '#000000'
    });

    // Sync values from original to clone
    const originalInputs = originalElement.querySelectorAll('input, textarea, select');
    const cloneInputs = clone.querySelectorAll('input, textarea, select');
    
    originalInputs.forEach((input, index) => {
        const cloneInput = cloneInputs[index];
        
        // Force styling on inputs for PDF
        cloneInput.style.color = '#000000';
        cloneInput.style.borderColor = '#000000';
        cloneInput.style.background = 'transparent';
        
        if (input.type === 'checkbox' || input.type === 'radio') {
            cloneInput.checked = input.checked;
            if (input.checked) {
                cloneInput.setAttribute('checked', 'checked');
            }
        } else if (input.tagName === 'TEXTAREA') {
            cloneInput.innerHTML = input.value;
            cloneInput.value = input.value;
            cloneInput.style.resize = 'none';
        } else {
            cloneInput.setAttribute('value', input.value);
            cloneInput.value = input.value;
        }
    });

    // Strip any animation classes from all children in the clone
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
        el.classList.remove('reveal', 'aos-animate');
        el.style.transition = 'none';
        el.style.animation = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.color = '#000000'; // Force black text
        if (el.style.borderColor) {
             el.style.borderColor = '#000000';
        }
    });
    
    // Add clone to wrapper, and wrapper to body
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    
    // Scroll to top to ensure clean capture
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Options for html2pdf
    const opt = {
        margin:       0,
        filename:     'KIAS-Bestillingsskjema.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            logging: false, 
            useCORS: true, 
            scrollY: 0,
            windowWidth: 1200 // Force desktop width
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' }
    };

    // Small delay to ensure rendering
    setTimeout(() => {
        html2pdf().set(opt).from(clone).save().then(() => {
            // Clean up
            document.body.removeChild(wrapper);
            window.scrollTo(0, originalScrollY);
        }).catch(err => {
            console.error("PDF Generation Error:", err);
            alert("Det oppstod en feil under generering av PDF. Prøv igjen.");
            document.body.removeChild(wrapper);
            window.scrollTo(0, originalScrollY);
        });
    }, 500);
}
