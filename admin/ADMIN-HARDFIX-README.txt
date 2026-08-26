BENVOR ADVANCED DECAP ADMIN — SAFE HARDFIX

ROOT CAUSE
The previous builder-admin.js installed a MutationObserver on the entire document body.
Every observed change ran updateRouteBadge(), which wrote to the toolbar text node again.
That write itself created another mutation, producing a continuous self-triggering loop.
While Decap was loading config.yml, the loop consumed the browser main thread and caused
"Page Unresponsive" / permanent "Loading configuration...".

FIX
- Removed the global MutationObserver completely.
- Builder toolbar initializes once after Decap startup gets priority.
- Editor helper tip uses a bounded timer (maximum 20 attempts) and then stops.
- Route badge only writes when text actually changes.
- Exact Decap version 3.8.3 is pinned instead of using a version range.
- Custom preview and builder scripts are deferred.

EMERGENCY SAFE MODE
/admin/safe.html
This loads the same Decap CMS/config.yml with no custom toolbar and no preview extension.
If any future custom admin UI issue appears, use Safe Mode to edit content immediately.

NORMAL ADMIN
/admin/
