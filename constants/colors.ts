export default {
    // Primary Colors
    primary: '#4A90E2', // Light Blue for buttons, highlights, actionable elements
primaryLight: '#3385FF', // Lighter Blue for hover and focused elements
primaryDark: '#0052CC', // Darker Blue for active state or important buttons

// Teal and Secondary Colors
teal: '#00BFA6', // Main Teal for accents
tealLight: '#1FCCB3', // Lighter Teal for hover effects or light elements
tealDark: '#00A68F', // Darker Teal for active or selected items

secondary: '#6ED6D0', // Soft Teal for secondary buttons and icons
secondaryLight: '#1FCCB3', // Lighter Teal for secondary actions and highlights

// Accent Colors
accent: '#FF5A5F', // Coral Orange for urgent action buttons, notifications
accentGreen: '#A6F77B', // Lime Green for success messages, secondary buttons

// Background and Surface Colors
white: '#FFFFFF', // Background for most screens, text, and icons
lightGray: '#F4F4F4', // Light gray background for sections, cards
gray: '#999999', // Medium gray for text
darkGray: '#666666', // Dark gray for less important text or icons
black: '#000000', // Text and icon color for primary elements


// Text Colors
textPrimary: '#333333', // Primary text color for body text
textSecondary: '#666666', // Secondary text color for descriptions
textTertiary: '#999999', // Tertiary text for inactive or less important elements
textLight: '#D1D5DB', // Light text color for faded elements
textBlack: '#000000',
textDeepGray: '##222222',

// Success, Error, and Warning Colors
success: '#4CAF50', // Success color for positive actions, confirmation
successLight: '#D1FAE5', // Light success color for background or borders
error: '#F44336', // Red for errors, warnings, or invalid actions
errorLight: '#FEE2E2', // Light red for error text or background
warning: '#FF9800', // Orange for warnings, cautionary messages
warningLight: '#FFECB3', // Light warning for background or faded alerts

// Gradient Colors
gradientStart: '#4A90E2', // Start of gradient, soft blue
gradientEnd: '#6ED6D0', // End of gradient, soft teal

// Card Background and Surface Colors
cardBackground: '#FFFFFF', // White background for cards and form sections
screenBackground: '#F4F4F4', // Light gray background for screens
border: '#E0E0E0', // Soft gray for borders around input fields, cards, etc.

// Shadow Effects
shadow: {
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 3, // Light shadow for buttons and input fields
},

cardShadow: {
shadowColor: '#000',
shadowOffset: { width: 0, height: 3 },
shadowOpacity: 0.12,
shadowRadius: 10,
elevation: 5, // Medium shadow for elevated card components
},

strongShadow: {
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 12,
elevation: 6, // Stronger shadow for prominent sections or highlighted items
},

// Status Colors for Verified/Unverified States
verified: '#10B981', // Green for verified items
verifiedBg: '#D1FAE5', // Light green for backgrounds or borders around verified items
pending: '#F59E0B', // Orange for pending status
pendingBg: '#FEF3C7', // Light orange for pending backgrounds

// Overlay Colors
overlay: 'rgba(13, 27, 42, 0.7)', // Dark overlay for modal or popup screens
  overlayLight: 'rgba(13, 27, 42, 0.4)', // Light overlay for semi-transparent backgrounds
  overlayDark: 'rgba(13, 27, 42, 0.85)', // Darker overlay for more intense focus

  // Inactive Tab Color
  tabInactive: '#9CA3AF', // Color for inactive tabs in navigation

  // Vehicle Type Colors
  vehicleType: {
    bike: '#F59E0B', // Bike color (orange)
    mini: '#3B82F6', // Mini vehicle color (blue)
    sedan: '#8B5CF6', // Sedan color (purple)
    premium: '#0D1B2A', // Premium vehicle color (dark)
  },

  // Gradients for different sections
  gradient: {
    primary: ['#4A90E2', '#6ED6D0'], // Primary gradient for top bars or action buttons
    secondary: ['#66D9EF', '#A6F77B'], // Secondary gradient for highlights or call-to-action sections
    card: ['#FFFFFF', '#F4F4F4'], // Soft gradient for cards, creating depth
    premium: ['#6366F1', '#8B5CF6'], // Gradient for premium features or offers
    success: ['#10B981', '#34D399'], // Gradient for success messages or indicators
  },
};
