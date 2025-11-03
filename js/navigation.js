document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            
            navMenu.classList.toggle('open');
        });
        
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navMenu.contains(event.target)) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('open');
            }
        });
        
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('open');
            });
        });
    }
    
    let lastScroll = 0;
    const header = document.querySelector('.site-header');
    const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Don't hide if at the very top
        if (currentScroll <= 0) {
            header.classList.remove('hidden');
            return;
        }

        // Scrolling down
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            header.classList.add('hidden');
        }
        // Scrolling up
        else if (currentScroll < lastScroll) {
            header.classList.remove('hidden');
        }

        lastScroll = currentScroll;
    });
});
