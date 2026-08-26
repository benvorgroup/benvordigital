BENVOR DIGITAL CUSTOM CMS
=========================

Main editor:
  /admin/

Emergency fallback:
  /admin/safe.html

Repository:
  benvorgroup/benvordigital
Branch:
  main
OAuth worker:
  https://benvor-cms-auth.benvorgroup.workers.dev/

WHAT CHANGED
------------
1. /admin/ is now a custom GitHub-powered CMS application instead of the Decap interface.
2. The existing Decap safe editor remains at /admin/safe.html.
3. Clean three-column page builder:
   - left: pages + page sections
   - center: responsive live website preview
   - right: Content, Layout, Design, Responsive, and Developer/Advanced controls
4. Click a section in preview to select it in the editor.
5. Drag page sections in the left navigator to reorder them.
6. + Add Section opens a visual block library.
7. New Page supports both blank pages and templates.
8. Autosave stores drafts locally in the browser. Publishing commits JSON to GitHub main.
9. Version history uses GitHub commits and can restore a previous file version into a new draft.
10. Dedicated management areas: Global Components, Brand System, Media, SEO & AEO, Forms & Leads, Templates, Integrations, Version History, Users & Roles.
11. Instagram and X were removed from public footer social links.
12. Facebook now links to https://www.facebook.com/BenvorDigital.
13. LinkedIn remains visible but disabled until a final LinkedIn URL is added.

AUTHENTICATION
--------------
The custom CMS first tries the existing GitHub OAuth worker. Because different Decap OAuth proxies can return slightly different message formats, a session-only GitHub token fallback is also included. The token fallback is stored in sessionStorage, not localStorage.

PUBLISHING MODEL
----------------
Autosave = browser-local draft only.
Publish = GitHub commit to the main branch.
Cloudflare then deploys the GitHub commit through the existing deployment pipeline.

ROLE SECURITY
-------------
The Users & Roles screen reflects the planned editorial roles, but a browser-only static CMS cannot securely enforce field-level permissions. GitHub repository permissions remain the actual security boundary. A server-side identity/permission service would be required for true granular role enforcement.

DEPLOYMENT
----------
Use the same Cloudflare Pages settings as before:
  Framework preset: None
  Build command: none
  Output directory: /

Upload the repository contents directly so index.html, admin/, assets/, and content/ are at repo root.
