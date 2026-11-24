# Dynamic portfolio with admin dashboard: design

Date: 2026-11-23 (updated 2026-11-24 with the redesign)
Status: approved by the owner on 2026-11-24

## Intent

Today the portfolio is one static page (`index.html` + `script.js` + Tailwind v4 CLI). Every project, skill, service and contact link is hard-coded, so each update means editing HTML by hand.

The goal is to rebuild it as a dynamic site so the owner (Tola) can **update information and add new skills, projects and background entries from a dashboard, without touching code or redeploying**.

At the same time the public site gets a **new look**: a Flash-inspired black-and-red design with lightning effects. It was designed and approved section by section as a static demo: **`mockups/demo-v7.html`**. That file is the visual source of truth. The real site must look and behave like it.

## Goals

- The public portfolio renders all of its content from a database and looks like `mockups/demo-v7.html`.
- A login page gives access to an admin dashboard. Only the owner can log in.
- From the dashboard the owner can add, edit, delete, hide/show and reorder:
  - skills (name + percentage)
  - resume entries: education, work experience, achievements
  - "What I can build for you" items
  - projects, including uploading an image and choosing a category
  - contact methods and social media links
- The owner can also edit the single-value content: name, role line, avatar, the About text and info list, CV PDF, the "Open to work" badge, and the copyright line.
- A save shows up on the public site within seconds, with no redeploy.

## Non-goals

- Multiple users, roles, or a sign-up page.
- A blog, contact form, analytics, or multi-language support. These can come later, but nothing here should depend on them.
- A live side-by-side preview inside the dashboard. A "View on site" link is enough.
- A separate "All projects" page. The slider handles any number of projects. It can be added later if there are 20+.

## Anti-goals (would count as failure even if it works)

- Anyone other than the owner can change content, through the UI **or** by calling Supabase directly.
- The public site shows a blank or flashing page while content loads. Content must be in the server-rendered HTML.
- The lightning effects make the site slow or janky, or play for visitors who have turned on reduced motion.
- Updating any content listed in the goals still needs a code change.
- The site uses DC/Marvel logos, character art or the Flash emblem. The look is Flash-*inspired*, using the owner's own avatar and colours.

## Constraints

- The owner knows HTML, Tailwind and JavaScript, and has some React. Keep the code in **plain JavaScript (no TypeScript)** and conventional, so they can maintain it.
- Tailwind CSS v4.
- Free tiers only: Vercel Hobby and Supabase Free. Supabase Free pauses a project after about a week with no activity, which is acceptable.
- The owner has MySQL locally, but it is **not** used. Supabase is hosted.
- No real photos of the owner anywhere. The site uses the 3D avatar (`img_file/avatartola.png`).

## Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| **Next.js + Supabase** | Owner learns Next.js. Login, database and file storage are managed. Pages are server-rendered, so they're fast and readable by Google. | **Chosen** |
| Next.js + MySQL (+ Prisma, Auth.js) | Reuses MySQL knowledge, but needs a hosted MySQL in production and hand-built login and uploads. More security surface. | Rejected |
| Express + EJS + SQLite/MongoDB | Closest to plain HTML, but login and security are hand-rolled and hosting is clunkier. | Rejected |
| Keep plain HTML/JS + Supabase from the browser | Fastest, but content loads after the page (bad for SEO and first paint) and it gets messy as the site grows. | Rejected |

The owner picked Next.js + Supabase.

## Tech stack

| Piece | Role |
|---|---|
| Next.js (current stable, App Router) | Public page, `/login`, `/admin/*`, Server Actions for writes |
| React | Components for each section |
| JavaScript | Language (no TypeScript) |
| Tailwind CSS v4 | Styling; design tokens go in `@theme` in `app/globals.css` |
| Supabase Postgres | Content tables |
| Supabase Auth | Email + password login for the one admin |
| Supabase Storage | Images and the CV PDF |
| `@supabase/supabase-js` + `@supabase/ssr` | Cookie-based auth session in Next.js |
| Font Awesome (free) | Icons, stored as class strings such as `fa-brands fa-github` |
| Google Fonts via `next/font` | Barlow Semi Condensed (headings) and Barlow (text) |
| Vercel | Hosting, auto-deploy from GitHub |

## How it works

1. **Public visit.** `/` is a server component that reads the visible rows from Supabase and renders every section into the HTML. The page is cached (statically generated). The interactive parts (section switching, lightning, slider, filters, cursor, phone menu) are client components layered on top.
2. **Login.** `/login` signs in with Supabase Auth and the session is stored in cookies. A Next.js request guard (middleware, called "proxy" in newer versions) redirects any unauthenticated request for `/admin/*` to `/login`.
3. **Edit.** Dashboard forms call Server Actions. Each action:
   - checks the session again on the server
   - writes to Supabase and uploads files to Storage if needed
   - calls `revalidatePath('/')` so the public page rebuilds on its next request
4. **Security in the database.** Row Level Security is on for every table:
   - Anyone can `select` rows where `is_visible = true`. `site_settings` is readable by anyone.
   - Only the admin can insert, update or delete. The policies check `auth.uid()` against the admin's user id, not just "is logged in".
   - Public sign-ups are **disabled** in Supabase Auth settings. The admin account is created once by hand.

## Public site

The public site is one page with five sections, switched in place like the reference site https://sokheng.netlify.app/. **Match `mockups/demo-v7.html` for every detail below.** Its CSS and JS can be ported almost directly.

### Structure and navigation

- **Menu:** HOME · ABOUT · RESUME · PROJECTS · CONTACT, in uppercase with letter spacing.
- **Home** is a split screen. On the left are the name ("Tola" white, "Sann" red), the role line, the menu, "View my projects" and "Download CV" buttons, and GitHub / LinkedIn / Telegram / Email icons. On the right is the avatar in a circle with an "Open to work" badge.
- **Section transition:** clicking a section rolls the homepage up into a slim top bar over 0.4s (height animates). Then the section panel drops down from above. Switching sections: the old panel lifts away and the new one drops in. Home: the bar drops back to full height. The top-bar name is uppercase "TOLA SANN". In the top bar, the name lines up with the left edge of the section panel and the menu with its right edge, like the reference.
- The URL hash follows the open section (`#about` etc.), and opening the page with a hash opens that section.
- **Phones (under 820px):** the menu becomes a three-line hamburger with no circle. The lines collapse when open. A full-screen menu slides in from the right with the homepage background and big uppercase links. Sections stack and the avatar sits above the text.

### Sections

| Section | Header (label / heading) | Content |
|---|---|---|
| About | ABOUT / LEARN MORE ABOUT ME | Avatar card, "Front-end developer" title, bio, info list (label: value pairs), Download CV button, then **Skills**: two columns of bars with percentages that fill when the section opens |
| Resume | RESUME / CHECK MY RESUME | Timeline: Education and Work experience on the left, Achievements on the right. Each entry has a title, a date tag, a place, and a description or bullet points |
| Projects | PROJECTS / MY WORK | **What I can build for you:** the main in-demand website types in columns (icon, name, one line), plus a "Need something else? … Ask me about it" line linking to Contact. **Things I've built:** filter buttons, then a slider (3 cards per page on desktop, 2 on tablet, 1 with swipe on phones) with square arrows and dots |
| Contact | CONTACT / LET'S WORK TOGETHER | Email / WhatsApp / Telegram boxes, then **Social media**: Instagram, Facebook, TikTok, YouTube as cards in the same style (4 across on wide screens, 2 × 2 below 1200px, stacked on phones). Handles and links always stay on one line and never break mid-word. Copyright line |

Section headers are a small grey uppercase label with a 120px glowing red line, then a big uppercase heading. Block titles inside sections (Skills, What I can build for you, Things I've built, Social media) have a short glowing red line after them, the same 120px length as the section header line.

### Visual system

| Token | Value | Use |
|---|---|---|
| Black | `#000000` | page and phone-menu background |
| Carbon | `#141414` | cards |
| Line | `#2b2b2b` | borders |
| Red | `#d0101f` | primary button, section-panel top border |
| Red hot | `#ff2436` | "Sann", avatar ring, header lines, active filter text, icons |
| Gold | `#ffb300` | every hover, lightning glow |
| White / Grey | `#ffffff` / `#a3a3a3` | text |

- **Background:** the owner's contour SVG (`img_file/hero-contour.svg`) recoloured red, over black with a soft red glow on the right. A gold copy lights up locally where lightning lands.
- **Type:** Barlow Semi Condensed 700 for headings, Barlow for text. The homepage description has +3px line spacing and 1px letter spacing.
- **Corners:** everything inside the section panels is square (border-radius 0). The homepage buttons stay slightly rounded (6px). Icons, social icons and timeline dots stay round.
- **Avatar:** no background behind it. On the homepage it sits in a circle with a 5px glowing red neon border, head inside the circle. In About it sits in a plain card.
- **Hover:** links, buttons, icons, cards, filters and arrows all get a lightning-gold border/text with a soft glow. There are no background fills on hover. Menu links grow a gold underline from the centre over 0.3s (no underline unless hovered; the current section's link is white).
- **Scrollbar:** thin (6px), square, a red gradient thumb on a black track; it turns gold on hover or grab. There are **no arrow buttons** and the corners are square. Firefox gets `scrollbar-color` red on black, applied only via `@supports not selector(::-webkit-scrollbar)`, because in Chrome/Edge the standard properties override the custom bar and bring the arrows and rounded thumb back. Inspired by bookeyond.com's slim branded scrollbar, not copied.
- **Text never breaks mid-word:** the About info list goes to one column below 1000px, and handles and links stay on one line.
- **Cursor (mouse only):** a solid white 12px dot with easing. It stays white and the same size over links and buttons, and only shrinks briefly on press.

### Lightning effects

All are drawn on canvases with jagged, branching bolts (gold glow, white core). They are switched off entirely when `prefers-reduced-motion` is set.

- **Page load:** a bolt strikes the avatar circle with a screen flash.
- **Avatar ring:** gold arcs crackle constantly around the circle, and sparks shoot off it. They are masked so they never cross the avatar.
- **Background storm:** every 2–4.5s a bolt strikes, usually aimed behind visible text, with ground sparks and the gold contour glow.
- **Click / tap:** a bolt falls from the top of the screen onto the point, with a spark burst.
- **Mouse / finger trail:** a short crackling trail follows the pointer. A fast flick throws sparks.
- **Scroll:** bolts shoot from the pointer or finger in the scroll direction, plus one racing down a side of the screen.
- **Section open:** a bolt strikes the panel's top edge, which crackles briefly.
- **Phone menu:** the storm plays behind the menu links. The background and links are separate layers with the lightning between them.

### Other interactions

- **Project filters:** text-only buttons (no background). The chosen filter has red text. Changing the filter fades the cards out (0.2s), swaps them, and they rise back in one after another (70ms stagger). The slider resets to page 1 and the dots fade with the cards.
- **Skill bars** animate their fill each time About opens.

## Data model

Every list table has `id` (uuid), `sort_order` (int), `is_visible` (bool, default true), `created_at` and `updated_at`.

- **site_settings**: a single row (`id = 1`).
  - Home: `first_name` ("Tola"), `last_name` ("Sann", shown in red), `role_line` (the description sentence), `avatar_url`, `open_to_work` (bool, shows the badge), `cv_url`
  - About: `about_title` ("Front-end developer"), `about_body`, `about_body_2` (optional second paragraph), `about_facts` (jsonb array of `{label, value}`)
  - Projects: `build_more_text` (the "Need something else?" line)
  - Footer: `copyright_text`
  - Site: `site_title`
  - Section headers: `section_headers` (jsonb), one entry per section (`about`, `resume`, `projects`, `contact`), each with `label` (e.g. "ABOUT") and `heading` (e.g. "Learn more about me").
  - Block titles: `block_titles` (jsonb): `skills`, `build`, `built`, `social` (e.g. "Skills", "What I can build for you", "Things I've built", "Social media").
  - The menu labels stay in code, so the navigation always matches the sections.
  - *Builder's call:* `role_line`, `about_body` and `about_body_2` support one bit of formatting: `**bold**`. It is rendered safely by escaping the text first, then turning `**…**` into `<strong>`. The dashboard shows a one-line hint. This keeps the bold "junior front-end developer" editable without a rich-text editor.
- **skills**: `name`, `percent` (0–100).
- **resume_entries**: `kind` (`education` | `work` | `achievement`), `title`, `date_label` (free text such as "2021 – 2024" or "Silver · 2022"), `place` (school, company or organiser), `description` (optional), `bullets` (`text[]`, optional).
- **build_items** ("What I can build for you"): `title`, `icon`, `description`.
- **project_categories**: `name` (e.g. "Website", "React app", "Design"). These drive the filter buttons; "All" is always first.
- **projects**: `title`, `description`, `category_id`, `image_url`, `live_url` (optional), `code_url` (optional).
- **contacts**: `kind` (`contact` | `social` | `profile`), `platform` ("Email", "Instagram"…), `icon`, `label` (shown text or handle), `url`, `show_in_hero` (bool).
  - `contact` rows are the Contact boxes (Email, WhatsApp, Telegram).
  - `social` rows are the Social media cards (Instagram, Facebook, TikTok, YouTube).
  - `profile` rows appear nowhere in the Contact section (GitHub, LinkedIn).
  - Homepage icons are any rows with `show_in_hero = true`: GitHub and LinkedIn (`profile`), plus Telegram and Email (`contact`).
  - *Builder's call:* a third kind rather than another flag, so GitHub and LinkedIn can't accidentally show under Contact.

**Storage:** one public bucket, `media`. Anyone can read it; only the admin can write. Uploads go to `avatar/`, `projects/` and `files/` (the CV).

**Seeding:** a SQL seed script loads only the owner's **real** content from the old site: name, role line, bio, About info list, skill names, the "What I can build" items, the "My Portfolio" project, contact and social links, the avatar and the CV. **No sample or placeholder entries and no "Sample" badges.** Resume entries start empty, and so do other projects. The owner adds them in the dashboard. Skill percentages are seeded as editable starting values.

**Empty states on the public site:** a Resume group with no entries (e.g. no achievements yet) is hidden. If the whole Resume section is empty, it shows one line ("Resume coming soon.") instead of empty columns. If there are no projects, Projects shows only "What I can build for you".

## Routes

```
/                      public portfolio (one page, sections switched in place)
/login                 sign in
/admin                 overview: counts per section + "View site"
/admin/site            name, role line, avatar, open-to-work, CV, About text and info list, section headers and block titles, copyright
/admin/skills          list + add/edit (name, percent)
/admin/resume          list grouped by Education / Work / Achievements + add/edit
/admin/build           "What I can build for you" items
/admin/projects        list + add/edit (with image upload) + manage categories
/admin/contacts        contact methods and social links
```

Signing out is a button in the dashboard sidebar.

## Dashboard design

The dashboard is a private tool for one person. It uses the public site's identity but stays quiet and practical.

- **Colours and type:** the same tokens as the public site (black, carbon, line, red, gold; Barlow Semi Condensed + Barlow). Red is for primary buttons, gold for hover and focus, `#f26d6d` for delete and errors only.
- **Layout:**
```
┌──────────────┬───────────────────────────────────────────┐
│ TOLA SANN    │ Projects                    [Add project] │
│              │───────────────────────────────────────────│
│ Site text    │ ⠿ [img] My Portfolio      Visible  Edit   │
│ Skills       │ ⠿ [img] Shop website      Visible  Edit   │
│ Resume       │ ⠿ [img] Landing page      Hidden   Edit   │
│ What I build │                                           │
│ Projects  ●  │                                           │
│ Contacts     │                                           │
│ View site    │                                           │
│ Sign out     │                                           │
└──────────────┴───────────────────────────────────────────┘
```
- **Lists are rows, not cards.** Each row has a drag handle, a thumbnail or icon, the title, a visibility toggle and Edit. Hidden rows are dimmed.
- **Edit and Add open a drawer** from the right with the form. Delete sits at the bottom of the drawer and asks for confirmation.
- Icon fields show a live preview of the Font Awesome class as you type. Percent fields show a live bar.
- On mobile, the sidebar collapses to a top menu and the drawer becomes full-screen.
- **Login page:** the contour background, "TOLA SANN", and one lightning strike on load, above a small form. The rest of the dashboard has no ambient lightning.
- **Copy:** buttons say what they do ("Add project", "Save changes", "Delete project"). Toasts match ("Changes saved. Your site is updated."). Empty states invite action ("No projects yet. Add one to show it on your site."). Login error: "Email or password is incorrect."
- Reduced motion is respected, and every control has a visible focus ring.

## Repo and deployment

- Before anything is replaced, the current static version is tagged `static-v1` so it stays easy to recover.
- The Next.js app replaces the static files at the root of this repo. `mockups/demo-v7.html` and its two SVGs stay in the repo as the design reference.
- Secrets go in `.env.local`, which is git-ignored: the Supabase URL, the anon key, and the admin user id. The same values are set in Vercel project settings.
- Database schema, RLS policies and the seed live as SQL files in `supabase/` so the setup is reproducible.
- The owner creates the Supabase and Vercel accounts (they need the owner's sign-in). The plan must include step-by-step instructions for that part.

## Decided with the owner

- The current site is **not online anywhere**, so the Next.js app can simply replace the static files in this repo. There's no cutover step and no domain to move. Vercel is set up fresh.
- `img_file/laa-icon.png` and `img_file/portfolio.jpg` are deleted in the working tree. The new design doesn't use them, so the builder leaves them as the owner left them and doesn't restore them.

## Left to the builder

- Drag-and-drop library for reordering (e.g. dnd-kit). Up/down buttons are acceptable if simpler.
- Form validation approach.
- Image handling: resizing or `next/image`, and file size limits (suggest 5 MB).
- Folder structure inside `app/` and `components/`.
- How to split the demo's single script into client components (lightning, section switcher, slider, cursor, phone menu), as long as the behaviour matches.
- Whether the drawer uses parallel/intercepting routes or local state.
- Testing level: a manual checklist is the minimum. It must cover the RLS anti-goal by trying a write with the anon key and confirming it is rejected, and check reduced motion.
