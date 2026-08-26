BENVOR DIGITAL — CLEAN PROFESSIONAL PAGE BUILDER
Version: Clean Professional Builder 1.0
Base: ADMIN-UNRESPONSIVE-HARDFIX

WHAT CHANGED
============
1. /admin/ is now the primary clean visual builder experience.
2. /admin/safe.html remains the emergency Decap fallback and does not load custom builder JS.
3. No global MutationObserver is used. The previous browser-freeze fix is preserved.
4. Light professional admin UI with Benvor navy/blue styling.
5. Page navigator appears on the left while editing Pages/Landing Pages.
6. Live preview is central; Decap settings are moved to the right on supported modern browsers.
7. Settings panel can be collapsed/reopened.
8. Five clean control tabs: Content, Layout, Design, Responsive, Advanced.
9. Advanced controls are gated behind Developer Mode in the custom toolbar; underlying Decap fields remain preserved.
10. Desktop, Laptop, Tablet and Mobile preview presets.
11. Click a section in the preview to focus/select its matching section in the editor where Decap exposes the matching control.
12. Searchable visual Add Section library with block categories and visual mini-previews.
13. New Page flow includes blank Page / blank Landing Page plus guided template recipes.
14. Template & Component Library collection added.
15. Forms & Lead Manager collection added.
16. Media Asset Manager collection added with desktop/mobile asset, alt text, category, focal position, aspect ratio and usage notes.
17. Advanced SEO/AEO fields added to page-type content where an SEO object exists.
18. Integrations Hub fields added to global settings.
19. Draft status + stability-safe autosave attempt: it only runs after a detected edit and only if Decap exposes an enabled Save button.
20. Version History opens the current content file's GitHub commit history.

GLOBAL COMPONENT RULE
=====================
Header and footer remain global. Per-page Show Header / Show Footer controls were removed from the CMS schema. Existing stored values were not deleted from content files, so the public site output is not unexpectedly redesigned by this package.

SOCIAL MEDIA CHANGE
===================
Facebook:
https://www.facebook.com/BenvorDigital

LinkedIn:
Visible but disabled until the final LinkedIn URL is entered.

Instagram:
Removed from public footer/contact social links.

X / Twitter:
Removed from public footer/contact social links.

The change is applied in content/settings.json, the dynamic renderer and all static fallback HTML footers.

STABILITY-FIRST DECISION
========================
This package intentionally keeps Decap CMS + GitHub as the publishing engine. It does not replace Decap with a custom GitHub CMS application.

Some requested high-end CMS concepts (true field-level role enforcement, one-click arbitrary template cloning, named visual checkpoints with section-level rollback, and a second independent drag engine in the custom left navigator) are not forced through fragile DOM hacks. GitHub/Decap native workflow, permissions, history and native list ordering remain the source of truth for those actions.

SECTION REORDERING
==================
Use Decap's native Page Sections drag/reorder control inside the right settings pane. The custom left navigator is optimized for navigation/selection. This avoids introducing a second reorder engine that could desynchronize content.

DEPLOYMENT
==========
Upload/commit the CONTENTS of this package to the repository root:
benvorgroup/benvordigital

Cloudflare Pages:
Framework preset: None
Build command: none
Build output directory: /

Then open:
https://benvordigital.com/admin/

Emergency fallback:
https://benvordigital.com/admin/safe.html
