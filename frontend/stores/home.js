export const useHomeStore = defineStore('home', {
  state: () => ({
    header: {
      logo: {
        text: 'PirtTrip',
        image: '/images/logo.svg',
        href: '/',
        alt: 'PirtTrip logo',
      },
      navLinks: [
        { id: 'home', label: 'Home', href: '/' },
        { id: 'help', label: 'Help', href: '#help' },
        { id: 'wishlist', label: 'Wishlist', href: '#wishlist', icon: 'heart' },
      ],
      ctas: [
        {
          id: 'partner',
          label: 'For Businesses',
          href: '/business',
          variant: 'dark',
        },
        {
          id: 'login',
          label: 'Login as Traveler',
          href: '#login',
          variant: 'primary',
        },
      ],
      sticky: true,
      mobileMenuLabel: 'Open navigation menu',
      frame: {
        width: 1440,
        height: 132,
        opacity: 1,
        borderRadius: 6,
      },
      gradient: {
        angle: 0,
        stops: [
          { color: '#000000', position: 0 },
          { color: 'rgba(0, 0, 0, 0)', position: 100 },
        ],
      },
      scrollThreshold: 24,
      navTypography: {
        fontFamily: 'Plein, sans-serif',
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: '140%',
        letterSpacing: '0',
      },
      buttons: {
        width: 172,
        height: 52,
        gap: 6.02,
        borderRadius: 9,
        padding: '6.02px 11.29px',
        opacity: 1,
      },
    },

    hero: {
      background: {
        /** Admin dashboard will update this path only; gradient stays fixed below */
        image: '/images/hero/hero-bg.png',
        alt: 'Lake and mountain landscape hero background',
        position: 'center center',
        /** Figma: base #D9D9D9 + overlay gradients over image */
        baseColor: '#D9D9D9',
        overlayLayers: [
          'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
          'linear-gradient(245.78deg, rgba(255, 171, 11, 0.3) 24.25%, rgba(0, 0, 0, 0.3) 73.29%)',
        ],
        frame: {
          width: 1440,
          height: 928,
          opacity: 1,
        },
      },

      title: {
        desktop: [
          { text: 'Your ', highlight: false },
          { text: 'Next Group Trip', highlight: true },
          { text: ' Starts Here!', highlight: false },
        ],
        mobile: [
          [
            { text: 'Your ', highlight: false },
            { text: 'Next', highlight: true },
          ],
          [
            { text: 'Group ', highlight: false },
            { text: 'Trip', highlight: true },
          ],
          [{ text: 'Starts Here!', highlight: false }],
        ],
      },

      subtitle: 'Discover | Compare | Decide | Travel',

      typography: {
        heading: {
          fontFamily: 'Plein, sans-serif',
          fontWeight: 700,
          fontSize: '45.16px',
          fontSizeMobile: '32px',
          lineHeight: '120%',
          letterSpacing: '0',
          textAlign: 'center',
        },
        subtitle: {
          fontFamily: 'Plein, sans-serif',
          fontWeight: 700,
          fontSize: '18px',
          fontSizeMobile: '14px',
          lineHeight: '120%',
          letterSpacing: '0',
          textAlign: 'center',
        },
      },

      showScrollIndicator: true,

      categoryBridge: {
        badgeOverlap: '2.75rem',
        tabMinWidth: '3rem',
        badgeGap: '0.5rem',
      },

      categories: [
        {
          id: 'trekking',
          label: 'Trekking & Hiking',
          image: '/images/categories/trekking-hiking.png',
        },
        {
          id: 'two-wheel',
          label: '2 Wheel Expedition',
          image: '/images/categories/two-wheel.png',
        },
        {
          id: 'four-wheel',
          label: '4 Wheel Expedition',
          image: '/images/categories/four-wheel.png',
        },
        {
          id: 'road-trip',
          label: 'Road Trip',
          image: '/images/categories/road-trip.png',
        },
        {
          id: 'wildlife',
          label: 'Wildlife',
          image: '/images/categories/wildlife.png',
        },
        {
          id: 'spiritual',
          label: 'Spiritual',
          image: '/images/categories/spiritual.png',
        },
        {
          id: 'girls-only',
          label: 'Girls Only',
          image: '/images/categories/girls-only.png',
        },
        {
          id: 'luxury',
          label: 'Luxury',
          image: '',
        },
      ],

      search: {
        scopeOptions: [
          { id: 'domestic', label: 'Domestic' },
          { id: 'international', label: 'International' },
        ],
        audienceOptions: [
          { id: 'all', label: 'All' },
          { id: 'women', label: 'Women/Girls Only' },
        ],
        selectedScope: 'domestic',
        selectedAudience: 'all',
        selectedTier: 'regular',

        desktopFields: [
          {
            id: 'from',
            label: 'From',
            value: 'Delhi',
            subValue: 'Current Location',
            icon: 'location',
            showGps: false,
          },
          {
            id: 'to',
            label: 'To',
            value: 'Odisha',
            subValue: 'Mahendra Giri Hills',
            icon: 'location',
          },
          {
            id: 'month',
            label: 'Month',
            value: 'May, 26',
            subValue: 'Thursday',
            icon: 'calendar',
            hasChevron: true,
          },
          {
            id: 'trip-type',
            label: 'Trip Type',
            value: 'Default',
            icon: null,
            hasChevron: true,
          },
          {
            id: 'travellers',
            label: 'No. of Travellers',
            value: '1 Traveller',
            icon: null,
            hasChevron: true,
          },
        ],

        mobileFields: [
          {
            id: 'from',
            label: 'From',
            placeholder: 'Select City',
            icon: 'location',
            showGps: true,
          },
          {
            id: 'to',
            label: 'To',
            placeholder: 'Select Destination',
            icon: 'location',
          },
          {
            id: 'month',
            label: 'Trip month',
            placeholder: 'Select Month',
            icon: 'calendar',
          },
        ],

        mobileSelectors: [
          {
            id: 'travellers',
            label: 'No. of Travelers',
            value: '1 Adult',
            icon: 'users',
          },
          {
            id: 'trip-type',
            label: 'Trip Type',
            value: 'Economy',
            icon: 'thumbs-up',
          },
        ],

        tripTiers: [
          {
            id: 'regular',
            title: 'Regular Group Trips',
            description: 'Budget-friendly group travel',
          },
          {
            id: 'exclusive',
            title: 'Exclusive Group Trips',
            description: 'Curated & selective experiences',
          },
          {
            id: 'luxury',
            title: 'Luxury Group Trips',
            description: 'Premium comfort & service',
            mobileTitle: 'Luxury Group Tours',
          },
        ],

        mobileTierChips: true,

        searchButton: {
          label: 'Search',
          href: '#search',
        },
      },

      deals: {
        title: 'Deals Today',
        items: [
          {
            id: 'goa',
            title: 'Goa Beach Escape',
            meta: '4D/3N - ₹7,999',
            mobileMeta: '4D/5N — ₹7,999',
            badge: '45% off',
            image: '/images/deals/goa.jpg',
            href: '#deal-goa',
          },
          {
            id: 'manali',
            title: 'Manali Adventure Trip',
            meta: '5D/4N - ₹9,499',
            mobileMeta: '5D/6N — ₹9,499',
            badge: '60% off',
            image: '/images/deals/manali.jpg',
            href: '#deal-manali',
          },
          {
            id: 'ladakh',
            title: 'Ladakh Expedition',
            meta: '7D/6N - ₹18,999',
            mobileMeta: '7D/6N — ₹18,999',
            badge: '30% off',
            image: '/images/deals/ladakh.jpg',
            href: '#deal-ladakh',
          },
          {
            id: 'kerala',
            title: 'Kerala Backwaters',
            meta: '5D/4N - ₹11,499',
            mobileMeta: '5D/4N — ₹11,499',
            badge: '25% off',
            image: '/images/deals/kerala.jpg',
            href: '#deal-kerala',
          },
        ],
      },

      upcomingTrips: {
        eyebrow: 'Upcoming Trips',
        title: "See What's coming new",
        tabs: [
          { id: 'national', label: 'National' },
          { id: 'international', label: 'International' },
        ],
        selectedTab: 'international',
        months: [
          { id: 'all', label: 'All' },
          { id: 'may', label: 'May' },
          { id: 'jun', label: 'Jun' },
          { id: 'jul', label: 'Jul' },
          { id: 'aug', label: 'Aug' },
          { id: 'sep', label: 'Sep' },
          { id: 'oct', label: 'Oct' },
          { id: 'nov', label: 'Nov' },
          { id: 'dec', label: 'Dec' },
          { id: 'jan', label: 'Jan' },
          { id: 'feb', label: 'Feb' },
          { id: 'mar', label: 'Mar' },
          { id: 'apr', label: 'Apr' },
        ],
        selectedMonth: 'all',
        trips: [
          {
            id: 'kashmir-1',
            scope: 'international',
            month: 'jun',
            duration: '7D/6N',
            discountLabel: '100 OFF',
            discountSuffix: 'Upto',
            title: 'Kashmir Paradise Tour',
            region: 'North-central, France',
            logo: '/images/logo.svg',
            image:
              'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
            badges: [
              { id: 'verified', label: 'Verified Business' },
              { id: 'custom', label: 'Customization Available' },
            ],
            tags: ['Ladakh', 'Rishikesh'],
            stats: [
              { k: 'Day', v: '1', label: 'Heritage Jaipur' },
              { k: 'Day', v: '5', label: 'Mountains of Mount Abu' },
              { k: '+', v: '8', label: 'Exploring Places' },
            ],
            ctas: { primary: 'Contact Curator', secondary: 'Compare +' },
          },
          {
            id: 'kashmir-2',
            scope: 'international',
            month: 'jul',
            duration: '7D/6N',
            discountLabel: '100 OFF',
            discountSuffix: 'Upto',
            title: 'Kashmir Paradise Tour',
            region: 'North-central, France',
            logo: '/images/logo.svg',
            image:
              'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
            badges: [
              { id: 'verified', label: 'Verified Business' },
              { id: 'custom', label: 'Customization Available' },
            ],
            tags: ['Ladakh', 'Rishikesh'],
            stats: [
              { k: 'Day', v: '1', label: 'Heritage Jaipur' },
              { k: 'Day', v: '5', label: 'Mountains of Mount Abu' },
              { k: '+', v: '8', label: 'Exploring Places' },
            ],
            ctas: { primary: 'Contact Curator', secondary: 'Compare +' },
          },
          {
            id: 'kashmir-3',
            scope: 'national',
            month: 'aug',
            duration: '6D/5N',
            discountLabel: '75 OFF',
            discountSuffix: 'Upto',
            title: 'Kashmir Paradise Tour',
            region: 'North-central, India',
            logo: '/images/logo.svg',
            image:
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
            badges: [
              { id: 'verified', label: 'Verified Business' },
              { id: 'custom', label: 'Customization Available' },
            ],
            tags: ['Ladakh', 'Rishikesh'],
            stats: [
              { k: 'Day', v: '1', label: 'Heritage Jaipur' },
              { k: 'Day', v: '5', label: 'Mountains of Mount Abu' },
              { k: '+', v: '8', label: 'Exploring Places' },
            ],
            ctas: { primary: 'Contact Curator', secondary: 'Compare +' },
          },
          {
            id: 'kashmir-4',
            scope: 'international',
            month: 'sep',
            duration: '7D/6N',
            discountLabel: '100 OFF',
            discountSuffix: 'Upto',
            title: 'Kashmir Paradise Tour',
            region: 'North-central, France',
            logo: '/images/logo.svg',
            image:
              'https://images.unsplash.com/photo-1441716844725-09cedc13a4e7?auto=format&fit=crop&w=1200&q=80',
            badges: [
              { id: 'verified', label: 'Verified Business' },
              { id: 'custom', label: 'Customization Available' },
            ],
            tags: ['Ladakh', 'Rishikesh'],
            stats: [
              { k: 'Day', v: '1', label: 'Heritage Jaipur' },
              { k: 'Day', v: '5', label: 'Mountains of Mount Abu' },
              { k: '+', v: '8', label: 'Exploring Places' },
            ],
            ctas: { primary: 'Contact Curator', secondary: 'Compare +' },
          },
        ],
      },
    },

    ui: {
      categoryScrollIndex: 0,
      dealsScrollIndex: 0,
      mobileMenuOpen: false,
      headerScrolled: false,
    },
  }),

  getters: {
    heroFrameStyle(state) {
      const { frame } = state.hero.background
      return {
        width: '100%',
        maxWidth: `${frame.width}px`,
        opacity: frame.opacity,
      }
    },
    heroGradientCss(state) {
      return (state.hero.background.overlayLayers || []).join(', ')
    },
    heroBackgroundStyle(state) {
      const { image, position, overlayLayers, baseColor } = state.hero.background
      const layers = [...(overlayLayers || []), `url("${image}")`]

      return {
        backgroundColor: baseColor || '#D9D9D9',
        backgroundImage: layers.join(', '),
        backgroundSize: 'cover',
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
      }
    },
    headerBarStyle(state) {
      const { frame, gradient } = state.header
      const style = {
        width: '100%',
        height: `${frame.height}px`,
        opacity: frame.opacity,
        background: 'transparent',
        transition: 'background 0.3s ease',
      }

      if (state.ui.headerScrolled) {
        const cssAngle = 180
        const stopList = gradient.stops
          .map((stop) => `${stop.color} ${stop.position}%`)
          .join(', ')
        style.background = `linear-gradient(${cssAngle}deg, ${stopList})`
      }

      return style
    },
    headerNavStyle(state) {
      const nav = state.header.navTypography
      return {
        fontFamily: nav.fontFamily,
        fontWeight: nav.fontWeight,
        fontSize: nav.fontSize,
        lineHeight: nav.lineHeight,
        letterSpacing: nav.letterSpacing,
      }
    },
    headerButtonStyle(state) {
      const btn = state.header.buttons
      return {
        width: `${btn.width}px`,
        minWidth: `${btn.width}px`,
        height: `${btn.height}px`,
        padding: btn.padding,
        borderRadius: `${btn.borderRadius}px`,
        opacity: btn.opacity,
      }
    },
    logoDisplay(state) {
      return state.header.logo.image
        ? { type: 'image', ...state.header.logo }
        : { type: 'text', ...state.header.logo }
    },
    selectedTripTier(state) {
      return state.hero.search.tripTiers.find(
        (t) => t.id === state.hero.search.selectedTier,
      )
    },
  },

  actions: {
    setScope(scopeId) {
      this.hero.search.selectedScope = scopeId
    },
    setAudience(audienceId) {
      this.hero.search.selectedAudience = audienceId
    },
    setTripTier(tierId) {
      this.hero.search.selectedTier = tierId
    },
    setMobileMenuOpen(open) {
      this.ui.mobileMenuOpen = open
    },
    toggleMobileMenu() {
      this.ui.mobileMenuOpen = !this.ui.mobileMenuOpen
    },
    setHeaderScrolled(scrolled) {
      this.ui.headerScrolled = scrolled
    },
    setHeroBackgroundImage(imagePath) {
      this.hero.background.image = imagePath
    },
    scrollCategories(direction) {
      const max = Math.max(0, this.hero.categories.length - 5)
      if (direction === 'next') {
        this.ui.categoryScrollIndex = Math.min(
          this.ui.categoryScrollIndex + 1,
          max,
        )
      } else {
        this.ui.categoryScrollIndex = Math.max(
          this.ui.categoryScrollIndex - 1,
          0,
        )
      }
    },
    scrollDeals(direction) {
      const max = Math.max(0, this.hero.deals.items.length - 2)
      if (direction === 'next') {
        this.ui.dealsScrollIndex = Math.min(this.ui.dealsScrollIndex + 1, max)
      } else {
        this.ui.dealsScrollIndex = Math.max(this.ui.dealsScrollIndex - 1, 0)
      }
    },
  },

  persist: {
    pick: [
      'hero.search.selectedScope',
      'hero.search.selectedAudience',
      'hero.search.selectedTier',
    ],
  },
})
