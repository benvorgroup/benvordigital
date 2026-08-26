BENVOR DIGITAL — FULL REPLACEMENT DECAP CMS WEBSITE

This is a NEW website structure built to match the approved Benvor Digital mockup.
It is not the previous HTML with another CSS theme layered on top.

WHAT THE LIVE WEBSITE NOW LOOKS LIKE
Home:
Header
Hero + animated analytics dashboard
Hero stats
Trusted brands + large stats
6-card services row
Why Benvor feature row
Selected Work case-study cards
3-card testimonials carousel with arrows/dots/swipe
About Benvor panel
Final CTA
Full multi-column footer

About, Services, Portfolio, Contact:
All rebuilt with the same white/navy/blue minimal premium-tech design system.
All have intentional dark-theme counterparts.

DECAP CMS
Open:
https://benvordigital.com/admin/

The CMS contains:
- Pages / Visual Page Builder
- Reusable Services
- Reusable Portfolio Projects
- Reusable Testimonials
- Reusable Team
- Website Settings

PAGE BUILDER
Every page stores a reorderable Page Sections list.
You can:
- add sections
- remove sections
- reorder sections by dragging them in Decap
- clear a page completely
- create new pages
- reuse services, projects, testimonials, and team members

Available blocks:
- Hero + Analytics Dashboard
- Trusted Brands + Stats
- Services Grid
- Why Benvor / Feature Columns
- Selected Work
- Portfolio Grid
- Testimonials Carousel
- About Preview
- Page Hero
- Image + Text
- Stats
- Process
- FAQ
- Team
- Contact Form + Details
- Rich Text
- Gallery
- Flexible Cards
- CTA
- Divider
- Spacer

VISUAL PREVIEW
Decap includes a custom live preview pane for page-builder entries.
It previews the major layout while you edit.
Important: Decap is still a structured CMS, so it does NOT support Webflow-style clicking and dragging elements directly on the live page.
The closest Decap workflow is:
1. edit fields
2. drag/reorder section blocks
3. use the live preview pane
4. publish through GitHub

If true direct on-page editing is required later, the content architecture in this package can be migrated to CloudCannon or another visual editor.

LIGHT / DARK MODE
Visitors get a theme toggle in the header.
- first visit can follow system preference
- visitor choice is saved in localStorage
- both light and dark palettes are editable in Website Settings

LOGOS
The exact two supplied Benvor Digital logo assets are included.
Header uses the horizontal logo.
Footer uses the stacked logo.
Transparent light/dark variants are in:
/assets/branding/

MAIN PAGES
/
 /about/
 /services/
 /portfolio/
 /contact/

CUSTOM PAGES
Create a new Page in Decap with a new slug.
View it at:
/page/?slug=YOUR-SLUG

PORTFOLIO PROJECT DETAIL
Every project has its own dynamic case-study view:
/project/?slug=PROJECT-SLUG

CONTACT FORM
The visual form is complete.
By default it runs in demo mode and shows the configured success message.
To make it send:
Website Settings -> Contact Form Processing -> Form Action / Endpoint
Paste your Formspree endpoint or your own Cloudflare form endpoint.

DEPLOY TO GITHUB
Repository:
benvorgroup/benvordigital

OAuth:
https://benvor-cms-auth.benvorgroup.workers.dev/

1. BACK UP your existing GitHub repository.
2. Extract this ZIP.
3. Replace the website repository contents with the files/folders in this package.
4. Make sure index.html, admin/, assets/, content/, about/, services/, portfolio/, contact/, page/, and project/ are at the repository ROOT.
5. Commit to main.
6. Let Cloudflare redeploy.
7. Test the homepage first.
8. Then open /admin/ and test a small text change.

IMPORTANT
Do not upload this website package into the OAuth Worker.
The OAuth Worker is separate and only handles GitHub login.

MOCKUP
REFERENCE-MOCKUP.png is included so the intended design can be compared during future changes.


RESPONSIVE CORRECTIONS IN THIS VERSION
- Header logo now uses height-based sizing so the long horizontal logo remains readable and is never stretched.
- Footer stacked logo is independently sized and remains proportional.
- Mobile dashboard cards switch from absolute overlays to a normal grid so they cannot overflow the viewport.
- Responsive breakpoints have been tuned for:
  large desktop / PC: 1600px+
  laptop / desktop: 1025-1599px
  iPad landscape / small laptop: up to 1024px
  iPad portrait / large tablets: up to 820px
  phones: up to 600px
  small phones: up to 390px
- All page grids collapse appropriately on tablets and phones.
- Forms, navigation, portfolio cards, testimonials, footer, CTA and page heroes are responsive.
- Horizontal overflow protection is enabled globally.


CURRENT BENVOR DIGITAL CONTACT DETAILS
Email: info@benvordigital.com
Office: Level 1, 9-13 Bronte Road, Bondi Junction, Sydney, NSW, Australia, 2022
