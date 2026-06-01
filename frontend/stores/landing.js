export const useLandingStore = defineStore('landing', {
  state: () => ({
    header: {
      logo: {
        image: '/images/logo.png',
        href: '/',
        alt: 'Pirttrip logo',
      },
      navLinks: [
        { id: 'home', label: 'Home', href: '/' },
        { id: 'become-a-partner', label: 'Become a Partner', href: '/become-a-partner' },
        { id: 'home-2', label: 'Home 2', href: '/home-2' },
      ],
      partnerCta: {
        label: 'Become a Partner',
        href: '/become-a-partner',
      },
      travelerCta: {
        label: 'Explore Trips',
        href: '/home-2',
      },
      mobileMenuLabel: 'Open navigation menu',
      scrollThreshold: 24,
    },
    ui: {
      mobileMenuOpen: false,
      headerScrolled: false,
    },
  }),

  actions: {
    setMobileMenuOpen(open) {
      this.ui.mobileMenuOpen = open
    },
    toggleMobileMenu() {
      this.ui.mobileMenuOpen = !this.ui.mobileMenuOpen
    },
    setHeaderScrolled(scrolled) {
      this.ui.headerScrolled = scrolled
    },
  },
})
