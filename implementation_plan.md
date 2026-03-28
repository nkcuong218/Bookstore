# Barnes & Noble Clone Implementation Plan

This plan outlines the steps to transform the current Vite + Material-UI starter template into a frontend clone of the Barnes & Noble website.

## User Review Required
> [!IMPORTANT]
> Please review this plan. This redesign will overwrite the current root component ([App.jsx](file:///d:/sourcecode/4th%20year/2nd%20term/PTHTTMDT/bookstore/Frontend/src/App.jsx)) and theme settings. The design will heavily utilize Material-UI (`@mui/material`) components to replicate the layout.

## Proposed Changes

### 1. Theme and Core Configuration
We will update the Material-UI theme to match Barnes & Noble's branding.
*   **Primary Color:** Deep dark green (`#3e5d58`)
*   **Typography:** Serif font for headings, sans-serif for body text.

#### [MODIFY] [src/theme.js](file:///d:/sourcecode/4th%20year/2nd%20term/PTHTTMDT/bookstore/Frontend/src/theme.js)
Update the palette and typography settings to reflect the new color scheme and font choices. Note that we will stay within the established Material UI CSS baseline.

#### [MODIFY] [src/App.jsx](file:///d:/sourcecode/4th%20year/2nd%20term/PTHTTMDT/bookstore/Frontend/src/App.jsx)
Remove the existing `Board` component mock and replace it with the new `HomePage` layout, wrapping it with the header and footer.

---

### 2. Layout Components

#### [NEW] `src/components/Header/Header.jsx`
*   Top utility bar (Promo messages).
*   Main row: Logo (Text-based with serif font for now), Search Bar with a deep green search button, and right-aligned action icons (Wishlist, Account, Cart).
*   Bottom row: Navigation links (Books, eBooks, Audiobooks, Kids, YA, etc.).

#### [NEW] `src/components/Footer/Footer.jsx`
*   Multi-column layout containing links for B&N Services, About Us, Quick Help.
*   Social media icons row.

---

### 3. Home Page Layout

#### [NEW] `src/pages/Home/HomePage.jsx`
The main page aggregating all sections:
*   **Hero Section:** A large promotional banner (using placeholder images or vibrant colored blocks) with a call-to-action button.
*   **Categories/Genres:** A row of circular icons representing different book genres.
*   **Bestsellers Book Grid:** A carousel/grid of book cards utilizing Material-UI `Card` component. Each card will display a book cover placeholder, title, author, and price, along with hover effects.

#### [NEW] `src/components/BookCard/BookCard.jsx`
A reusable component for displaying a single book item.

## Verification Plan

### Automated Tests
*   Since this is primarily a UI presentation layer update without complex unit tests currently set up, verification will be visually driven.
*   Run the development server using `npm run dev` or `yarn dev`.

### Manual Verification
*   The agent will run a browser subagent (or the user can open their browser) to verify:
    1. The Header is present and matches the dark green theme.
    2. The Home page renders the Hero banner and Book grid.
    3. The UI is responsive on standard desktop sizes.
    4. No console errors are thrown by React or MUI.
