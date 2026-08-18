PushTakim — Technical Context

Persistent technical memory for Codex.
Inspect the repository before assuming this document describes every implementation detail perfectly.

Production

Primary website:

pushtakim.co.il

Deployment has been handled through Vercel.

Source control/project work uses GitHub.

Never recreate hosting, DNS or deployment configuration simply because a new local environment is being used.

A new computer should connect to the existing project rather than creating a replacement project.

⸻

Development Safety

Before modifying the site:

1. Inspect repository status.
2. Identify the production branch.
3. Inspect recent commits.
4. Determine what is currently deployed.
5. Check whether previous Codex work was committed successfully.
6. Avoid overwriting newer production changes with an older local copy.

This is especially important after interrupted Codex sessions or computer crashes.

⸻

Existing Website Areas

The project has included functionality relating to:

* Public website
* Events
* Event schedules
* Ticket options
* Registration
* Health declarations
* Liability/participation declarations
* Administrative information
* Media/video
* Partner/community presentation
* Mobile and desktop layouts

Do not assume that all of these systems currently use the same data source.

Inspect the code before modifying them.

⸻

Payments / Ticketing

Ticket/payment flows have been integrated with external payment/ticketing systems during the project.

Historically, Grow has been used for payment processing/receipt-related workflows.

Ticket structures have changed during the PushTakim Tour.

Therefore:

Never hard-code assumptions based on an old event or old ticket price without inspecting the current state.

Past ticket examples are historical context, not permanent configuration.

⸻

Health Declarations / Waivers

This area requires particular caution.

There have been cases where participants completed forms successfully from the user’s perspective, while the expected information did not appear correctly in exported/event lists.

Therefore:

NEVER delete or migrate existing form/submission data before locating the actual stored records.

Before changing this system:

1. Identify every relevant form.
2. Identify where each form writes its data.
3. Identify how submissions relate to participants/orders/events.
4. Determine whether historical submissions still exist.
5. Verify exports/admin views independently from storage.
6. Back up existing records where possible.
7. Only then modify the architecture/UI.

A missing record in an export does NOT automatically mean the submission itself is missing.

⸻

Admin

Administrative functionality has previously experienced issues including login/session behavior.

Do not redesign authentication casually.

Before changing admin authentication:

* Inspect current auth implementation.
* Inspect relevant environment variables without exposing secrets.
* Determine whether the problem is frontend, session, deployment or configuration related.

Never place credentials or secrets inside these context documents.

⸻

Media / Hero

The website has used video/media prominently.

Historical issues have included delayed video loading and undesirable blank/black states before playback.

Loading experiences and visual transitions have been deliberately refined.

Do not remove working loading/fallback behavior without checking the resulting UX.

⸻

Responsive Design

The site is expected to work well on:

* Mobile
* Desktop

Mobile behavior is particularly important because a significant portion of users reach PushTakim through social media and shared links.

Any substantial UI modification should be checked at both mobile and desktop sizes.

⸻

Forms & Data — Long-Term Goal

The desired experience should eventually be simple:

Event/Activity → Registration/Purchase → Required declarations → Stored participant record → Clear admin view/export

The organizer should be able to determine:

* Who registered
* Relevant contact information
* Which activity/event they belong to
* Whether required declarations were completed
* Relevant registration/payment status

The system should avoid fragmented information that requires manually searching multiple unrelated places.

⸻

Historical Bugs Are Knowledge

When a meaningful bug is solved, add a short entry to the project’s decision/history documentation.

Record:

* Problem
* Cause
* Solution
* Anything future Codex sessions should avoid

Do NOT preserve huge debugging conversations.

Preserve the lesson.

⸻

Critical Rule for Codex

Before making significant changes:

READ BEFORE WRITE.

Inspect the relevant files and current implementation first.

Do not infer the architecture from this summary alone.
