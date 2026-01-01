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
    
    // Save current scroll position
    const originalScrollY = window.scrollY;
    
    // 1. Clone the element
    const clone = originalElement.cloneNode(true);
    
    // 2. Sync Input Values (Crucial for user data)
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

    // 3. Clean up the clone (Remove animations, force colors)
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
        el.classList.remove('reveal', 'aos-animate', 'active');
        el.style.transition = 'none';
        el.style.animation = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.color = '#000000'; // Force black text
        if (el.style.borderColor) {
             el.style.borderColor = '#000000';
        }
    });
    
    // 4. "Exclusive Mode" Strategy
    // Hide all existing body children
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => child.style.display = 'none');
    
    // Append clone directly to body
    document.body.appendChild(clone);
    
    // Style the clone to look like a document on the screen
    Object.assign(clone.style, {
        display: 'block',
        position: 'relative', // Normal flow
        width: '100%',
        maxWidth: '210mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '20px',
        boxShadow: 'none',
        zIndex: '9999',
        visibility: 'visible'
    });
    
    // Scroll to top to ensure html2canvas sees it from 0,0
    window.scrollTo(0, 0);

    // 5. Generate PDF
    const opt = {
        margin:       10,
        filename:     'KIAS-Bestillingsskjema.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            logging: false, 
            useCORS: true, 
            windowWidth: 1200, // Force desktop width
            scrollY: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' }
    };

    // Small delay to allow DOM to settle
    setTimeout(() => {
        html2pdf().set(opt).from(clone).save().then(() => {
            // 6. Restore Original State
            document.body.removeChild(clone);
            bodyChildren.forEach(child => child.style.display = '');
            window.scrollTo(0, originalScrollY);
        }).catch(err => {
            console.error("PDF Generation Error:", err);
            alert("Det oppstod en feil. Prøv igjen.");
            // Restore state on error too
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
            bodyChildren.forEach(child => child.style.display = '');
            window.scrollTo(0, originalScrollY);
        });
    }, 800); // Increased delay slightly to be safe
}
