# Dynamic Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Tola's static portfolio as a Next.js + Supabase site whose every piece of content is edited from a private admin dashboard, with the approved Flash-style design from `mockups/demo-v7.html`.

**Architecture:** One Next.js App Router project at the repo root. `/` is a cached server component that loads content from Supabase and renders five sections. Client components on top handle section switching, lightning, slider, filters, cursor and phone menu, ported from the demo. `/login` and `/admin/*` use Supabase Auth cookies. Writes go through Server Actions that check the admin, write, then `revalidatePath('/')`. Security is enforced again in Postgres with RLS through an `is_admin()` function.

**Tech Stack:** Next.js (latest, App Router, JavaScript), React, Tailwind CSS v4, Supabase (Postgres, Auth, Storage) via `@supabase/supabase-js` + `@supabase/ssr`, `@fortawesome/fontawesome-free`, `next/font/google` (Barlow, Barlow Semi Condensed), Vitest, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-23-dynamic-portfolio-design.md` (approved). Visual source of truth: `mockups/demo-v7.html`. Where this plan says "port from the demo", copy the demo's markup, CSS and JS behaviour, and don't redesign.

## Global Constraints

- Plain JavaScript only. No TypeScript files (`.js` / `.jsx` / `.mjs`).
- Tailwind CSS v4. Design tokens go in `@theme` in `app/globals.css`.
- Free tiers only: Vercel Hobby, Supabase Free.
- No real photos of the owner. The avatar is `avatartola.png` or an uploaded replacement.
- No DC/Marvel logos, character art or Flash emblem.
- Colours: black `#000000`, carbon `#141414`, line `#2b2b2b`, red `#d0101f`, red-hot `#ff2436`, gold `#ffb300`, white `#ffffff`, grey `#a3a3a3`, delete/error `#f26d6d`.
- Fonts: Barlow Semi Condensed 600/700 for headings, Barlow 400/500/600 for text.
- Breakpoints from the demo: phone layout at `max-width:820px`, tablet at `max-width:1000px`.
- Every animation, and all lightning, is off under `prefers-reduced-motion: reduce`.
- Corners: square (radius 0) inside section panels. The homepage buttons are 6px. Icons and dots stay round.
- All hovers use gold (border/text + soft glow), never background fills. The cursor is a solid white 12px dot that does not change on hover.
- RLS on every table: public may read visible rows only; writes require `is_admin()`. Public sign-ups are disabled.
- Never seed or show "Sample" badges or placeholder entries. Resume entries and extra projects start empty.
- UI copy, verbatim: "Save changes", "Changes saved. Your site is updated.", "Email or password is incorrect.", "No projects yet. Add one to show it on your site.", "Resume coming soon."
- Secrets only in `.env.local` (git-ignored) and Vercel settings: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_USER_ID`.

## Review Focus

- **Empty content:** no resume entries in a group, no resume at all, no projects, no avatar or CV uploaded yet. Expect hidden groups, "Resume coming soon.", Projects showing only "What I can build for you", and the fallbacks `/avatartola.png` and `/portfolio-tola.pdf`. Pinned in Task 3 (`shapeContent` tests).
- **HTML typed into editable text,** e.g. `<script>` in the role line. It must show as literal text. Pinned in Task 3 (`renderBold` tests).
- **Unbalanced `**`** in bold text, e.g. `a **b`. Show it literally; never produce broken or unclosed markup. Pinned in Task 3.
- **Bad numbers and links in forms:** percent `120`, `-5` or `abc`; a link without `https://`. Reject with a field message, and clamp any stored out-of-range percent to 0–100 on display. Pinned in Task 10 (validators) and Task 3 (clamp).
- **Hidden things leaking:** a hidden project, or a category whose projects are all hidden. These must not appear on the public site and must not produce an empty filter button. Pinned in Task 3 (`buildFilters` tests) and Task 2 (RLS check script).

---

## File structure

```
app/
  layout.js                 fonts, Font Awesome CSS, globals.css, <body>
  globals.css               @theme tokens + all public-site CSS ported from the demo
  page.js                   server: getSiteContent() → <Portfolio content={…}/>
  login/page.js             login form (+ one lightning strike)
  login/actions.js          signIn(formData), signOut()
  admin/layout.js           requireAdmin(), sidebar shell
  admin/page.js             overview counts + "View site"
  admin/site/page.js        Site text form
  admin/site/actions.js     saveSettings(formData)
  admin/[section]/page.js   generic list page for skills|resume|build|projects|contacts
  admin/actions.js          saveRowAction, deleteRowAction, moveRowAction, setVisibleAction
components/site/            Portfolio, Intro, HeroArt, SectionHead, BlockTitle, RichText,
                            AboutPanel, ResumePanel, ProjectsPanel, ProjectSlider,
                            ContactPanel, PhoneMenu, Cursor, Lightning
components/admin/           Sidebar, RowList, Drawer, Toast, fields/{Text,TextArea,Icon,Percent,Image,Pdf,Select,Facts,Toggle}
lib/format.js               escapeHtml, renderBold
lib/content.js              DEFAULT_SETTINGS, shapeContent, buildFilters, getSiteContent
lib/slider.js               perPage, pageCount, pageIndex
lib/lightning/bolt.js       boltPath
lib/admin/schema.js         ADMIN_SECTIONS (field definitions per table)
lib/admin/validate.js       validators
lib/admin/crud.js           swapOrder (pure) + server CRUD helpers
lib/supabase/server.js      createClient, getAdmin, requireAdmin
lib/storage.js              uploadMedia
proxy.js | middleware.js    guards /admin/*
supabase/schema.sql  supabase/policies.sql  supabase/storage.sql  supabase/seed.sql
scripts/check-rls.mjs       proves anon cannot write or read hidden rows
docs/setup-supabase-vercel.md   owner's step-by-step account setup
public/                     contour-red.svg, contour-gold.svg, avatartola.png, portfolio-tola.pdf, favicon
tests/                      Vitest unit tests mirroring lib/
```

---

### Task 1: Freeze the old site and scaffold the Next.js app

**Files:**
- Create: `package.json`, `next.config.mjs`, `postcss.config.mjs`, `jsconfig.json`, `vitest.config.mjs`, `.env.example`, `app/layout.js`, `app/page.js` (placeholder), `app/globals.css`, `tests/smoke.test.js`, `docs/setup-supabase-vercel.md`
- Move to `public/`: `mockups/contour-red.svg`, `mockups/contour-gold.svg` (copies; the mockup keeps its own), `img_file/avatartola.png`, `img_file/portfolio-tola.pdf`, `img_file/tolaicon.png` → `public/favicon.png`
- Delete: `index.html`, `script.js`, `tailwind/`, `node_modules/` (tracked by mistake), and old `package.json`/`package-lock.json` (replaced)
- Modify: `.gitignore` (add `node_modules/`, `.next/`, `.env*.local`)

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm test` (Vitest) scripts; `@/` import alias to the repo root.

- [ ] **Step 1: Commit the current static site and tag it.** Commit the design docs and the mockups folder (only `demo-v7.html`, `contour-red.svg` and `contour-gold.svg`; delete the other `mockups/*.html` drafts first), then `git tag static-v1`. Leave the deleted `laa-icon.png` and `portfolio.jpg` deleted (spec: "Decided with the owner").
- [ ] **Step 2: Scaffold** with `npx create-next-app@latest . --js --app --tailwind --eslint --no-src-dir --import-alias "@/*"` (into a temp dir and move the files in if the root isn't empty). Add `vitest` as a dev dependency and `"test": "vitest run"`. Add `@supabase/supabase-js`, `@supabase/ssr` and `@fortawesome/fontawesome-free`.
- [ ] **Step 3: Write the smoke test** `tests/smoke.test.js`: `expect(1 + 1).toBe(2)`, so the runner is proven.
- [ ] **Step 4: Run** `npm test`. Expected: 1 passed. Then run `npm run build`. Expected: build succeeds.
- [ ] **Step 5: Write `docs/setup-supabase-vercel.md` for the owner,** in plain numbered steps:
  1. Create a Supabase project (free) and copy the URL and anon key into `.env.local`.
  2. In Auth settings, turn **off** "Allow new users to sign up".
  3. In Auth → Users, add your user (email + password) and copy its id into `.env.local` as `ADMIN_USER_ID`.
  4. Run `supabase/schema.sql`, `policies.sql`, `storage.sql` and `seed.sql` in the SQL editor, then `insert into admins(user_id) values ('<your id>');`
  5. On Vercel, import the GitHub repo `laabythewayyy/portfolio` and add the same three env vars.
- [ ] **Step 6: Commit** `feat: scaffold Next.js app; tag static-v1`.

### Task 2: Database schema, security and seed

**Files:**
- Create: `supabase/schema.sql`, `supabase/policies.sql`, `supabase/storage.sql`, `supabase/seed.sql`, `scripts/check-rls.mjs`

**Interfaces:**
- Produces these tables, used by every later task. Every list table also has `id uuid pk default gen_random_uuid()`, `sort_order int not null default 0`, `is_visible bool not null default true`, `created_at`, `updated_at`.
  - `site_settings` (`id int pk check (id = 1)`): `first_name`, `last_name`, `role_line`, `avatar_url`, `open_to_work bool default true`, `cv_url`, `about_title`, `about_body`, `about_body_2`, `about_facts jsonb default '[]'` (array of `{label, value}`), `section_headers jsonb` (`{about:{label,heading}, resume:{…}, projects:{…}, contact:{…}}`), `block_titles jsonb` (`{skills, build, built, social}`), `build_more_text`, `copyright_text`, `site_title`, `updated_at`
  - `skills`: `name text not null`, `percent int not null check (percent between 0 and 100)`
  - `resume_entries`: `kind text check (kind in ('education','work','achievement'))`, `title`, `date_label`, `place`, `description`, `bullets text[] default '{}'`
  - `build_items`: `title`, `icon`, `description`
  - `project_categories`: `name text unique`
  - `projects`: `title`, `description`, `category_id uuid references project_categories on delete set null`, `image_url`, `live_url`, `code_url`
  - `contacts`: `kind text check (kind in ('contact','social','profile'))`, `platform`, `icon`, `label`, `url`, `show_in_hero bool default false`
  - `admins(user_id uuid pk)` and `is_admin() returns boolean` (`security definer`, `stable`, `select exists(select 1 from admins where user_id = auth.uid())`)

- [ ] **Step 1: Write `scripts/check-rls.mjs`.** It uses only the anon key from `.env.local` and prints one line per check, then exits non-zero if any check fails:
  - `insert into skills` is rejected → `PASS anon cannot insert`
  - `update site_settings` changes 0 rows or errors → `PASS anon cannot update settings`
  - `delete from projects` deletes 0 rows → `PASS anon cannot delete`
  - selecting `projects` returns no row with `is_visible = false` → `PASS hidden rows not readable`
  - uploading to bucket `media` is rejected → `PASS anon cannot upload`
- [ ] **Step 2: Run it against the empty project** (before the policies exist). Expected: at least one FAIL. This proves the script can fail.
- [ ] **Step 3: Write the four SQL files.**
  - `policies.sql`: enable RLS on all tables. On each list table, a `select` policy using `is_visible or is_admin()`, plus `insert/update/delete` policies using `is_admin()`. `site_settings`: public select `true`, admin update. `admins`: no public policies.
  - `storage.sql`: bucket `media` (public read) with insert/update/delete allowed only for `is_admin()`.
  - `seed.sql` holds only the real content below, with **no samples**. `sort_order` follows the listed order.
    - **site_settings:** first_name `Tola`, last_name `Sann`, role_line `I'm a **junior front-end developer** from Cambodia, building fast, clean and responsive websites.`, about_title `Front-end developer`, about_body and about_body_2 = the two About paragraphs in `mockups/demo-v7.html` (lines ~330 and ~339), about_facts `Name: Tola Sann · Based in: Cambodia · Role: Junior front-end developer · Email: suntola204@gmail.com · Focus: React, Tailwind CSS · Freelance: Available`, section_headers and block_titles = `DEFAULT_SETTINGS` values (Task 3), build_more_text `Need something else, like a web app or a dashboard? Tell me what you have in mind.`, copyright_text `© 2026 Laa Bytheway. All rights reserved.`, site_title `Tola Sann · Front-end developer`, avatar_url and cv_url null.
    - **skills (name/percent):** HTML / CSS 90, JavaScript 80, React 80, Tailwind CSS 85, Bootstrap 80, Laravel 65, PHP 65, Node.js 55, MySQL 70, Git / GitHub 75.
    - **build_items:** the four from the demo (E-commerce websites, Business websites, Landing pages, Portfolio websites) with their icons and lines.
    - **project_categories:** Website, React app, Design.
    - **projects:** one, "My Portfolio" (Website), with the demo's description.
    - **contacts:**
      - `profile`: GitHub `https://github.com/laabythewayyy` (hero), LinkedIn `https://linkedin.com/in/tola-sann-330441340` (hero)
      - `contact`: Email `mailto:suntola204@gmail.com` (hero), WhatsApp `https://wa.me/855963527860` (label `+855 96 352 7860`), Telegram `https://t.me/laabythewayyy` (hero, label `@laabythewayyy`)
      - `social`: Instagram `@_imbarryallen`, Facebook `Tola Sann`, TikTok `@laabythewayyy`, YouTube `@laabythewayyyy`, with the URLs from the demo
- [ ] **Step 4: Run the SQL in Supabase** (owner, following the setup doc), then run `node scripts/check-rls.mjs`. Expected: five PASS lines, exit 0.
- [ ] **Step 5: Commit** `feat: supabase schema, RLS, storage and real-content seed`.

### Task 3: Content loading and safe text formatting

**Files:**
- Create: `lib/format.js`, `lib/content.js`, `lib/supabase/server.js`, `tests/format.test.js`, `tests/content.test.js`

**Interfaces:**
- Consumes: the tables from Task 2.
- Produces:
  - `escapeHtml(text: string) → string` and `renderBold(text: string|null) → string` (safe HTML; `<strong>` is the only tag it emits)
  - `DEFAULT_SETTINGS` (object)
  - `shapeContent(raw) → SiteContent`, where `raw = {settings, skills, resume, build, categories, projects, contacts}` are row arrays (settings is a single row or null)
  - `SiteContent = {settings, avatarUrl, cvUrl, skills:[{id,name,percent}], resume:{education:[],work:[],achievement:[]}, resumeEmpty:boolean, build:[], projects:[{…row, category:string}], filters:string[], contacts:{contact:[],social:[],hero:[]}}`
  - `buildFilters(categories, projects) → string[]`
  - `getSiteContent() → Promise<SiteContent>` (server; queries all tables with the anon server client; not unit-tested)
  - `createClient() → Promise<SupabaseClient>` (server, cookie-based)
  - `getAdmin() → Promise<User|null>` (non-null only when `user.id === process.env.ADMIN_USER_ID`)
  - `requireAdmin() → Promise<User>` (calls `redirect('/login')` otherwise)

- [ ] **Step 1: Write the failing tests** in `tests/format.test.js`:
  - `renderBold("I'm a **junior** dev")` → `"I&#39;m a <strong>junior</strong> dev"`
  - `renderBold("**a** and **b**")` → `"<strong>a</strong> and <strong>b</strong>"`
  - `renderBold("<script>alert(1)</script>")` → `"&lt;script&gt;alert(1)&lt;/script&gt;"`
  - `renderBold("a **b")` → `"a **b"`
  - `renderBold(null)` → `""`
- [ ] **Step 2: Write the failing tests** in `tests/content.test.js`, using small inline fixtures:
  - resume rows of mixed kinds come back grouped and sorted by `sort_order`; `resumeEmpty` is `true` when there are no rows
  - `buildFilters([{id:1,name:'Website'},{id:2,name:'Design'}], [{category_id:1}])` → `['All','Website']` (a category with no projects gets no button)
  - a project with an unknown or null `category_id` gets `category: ''` and still counts toward "All"
  - a skill row with `percent: 140` is shaped to `100`, and `-5` to `0`
  - `contacts.hero` holds the `show_in_hero` rows across all kinds, in `sort_order`; `contacts.contact` excludes `profile` rows
  - settings `null` → `settings.section_headers.about.heading === 'Learn more about me'` and `avatarUrl === '/avatartola.png'`, `cvUrl === '/portfolio-tola.pdf'`
  - a settings row with `block_titles: {skills:'My skills'}` keeps the other block titles' defaults
- [ ] **Step 3: Run** `npm test`. Expected: the new tests fail (module not found).
- [ ] **Step 4: Implement `lib/format.js` and `lib/content.js`.** `renderBold` escapes first (`& < > " '`), then replaces `/\*\*(.+?)\*\*/g` with `<strong>$1</strong>`. `DEFAULT_SETTINGS.section_headers` holds About/"Learn more about me", Resume/"Check my resume", Projects/"My work", Contact/"Let's work together". `block_titles` holds Skills / What I can build for you / Things I've built / Social media. `shapeContent` deep-merges settings over the defaults, one level for the jsonb objects.
- [ ] **Step 5: Implement `lib/supabase/server.js`** with `createServerClient` from `@supabase/ssr` and the `cookies()` `getAll`/`setAll` adapter.
- [ ] **Step 6: Run** `npm test`. Expected: all pass.
- [ ] **Step 7: Commit** `feat: content shaping and safe bold formatting`.

### Task 4: Site shell, Home and section switching

**Files:**
- Create: `components/site/Portfolio.js`, `Intro.js`, `HeroArt.js`, `SectionHead.js`, `BlockTitle.js`, `RichText.js`, `PhoneMenu.js`, `Cursor.js`
- Modify: `app/layout.js`, `app/globals.css`, `app/page.js`

**Interfaces:**
- Consumes: `getSiteContent()` and `renderBold` (Task 3).
- Produces:
  - `<Portfolio content={SiteContent}>` (client): holds `section` state (`'home'|'about'|'resume'|'projects'|'contact'`) and syncs it with `location.hash`. It applies the demo's body classes (`open`, `menu-open`) and panel classes (`show`, `leaving`, `--delay`) with the demo's `go()` timings (0.4s roll-up, 0.25s leave, the drop keyframes), and renders the panels as children.
  - It exposes `section` to the panels via a prop, and to Lightning by dispatching `window` event `portfolio:section` with `detail: {section, delayMs}`.
  - `<SectionHead label heading id>`, `<BlockTitle>{text}</BlockTitle>`, `<RichText text as="p">` (uses `renderBold` with `dangerouslySetInnerHTML`).

- [ ] **Step 1: Port the demo's CSS** into `app/globals.css`: put the tokens from Global Constraints in `@theme` and the rest as plain CSS. Keep the demo's class names so ported markup matches. Load the fonts with `next/font/google` as CSS vars (`--font-barlow`, `--font-barlow-sc`), plus the Font Awesome CSS and `/favicon.png`, in `app/layout.js`.
- [ ] **Step 2: Build Home** (`Intro`, `HeroArt`) from the demo markup, filled from `content`:
  - name with the `.surname` span; the role line via `RichText`; the menu
  - "View my projects" opens the projects section; "Download CV" goes to `cvUrl`
  - hero icons from `contacts.hero`
  - the avatar from `avatarUrl` inside `.portrait`/`.frame` with `.ring`
  - the badge only when `settings.open_to_work`
- [ ] **Step 2b: Page title:** `app/page.js` exports `generateMetadata()` returning `{ title: content.settings.site_title }`.
- [ ] **Step 3: Build `PhoneMenu`** (`#menu-btn` lines-only hamburger, `#menu-bg`, `#mobile-menu` with uppercase links) and **`Cursor`** (a solid white dot, mouse-only via `(hover:hover) and (pointer:fine)`, shrinks on press, no hover change), both ported from the demo.
- [ ] **Step 4: Manually verify** with `npm run dev` against the seeded data, next to the demo at the same window size:
  - Home matches the demo; HOME/ABOUT… are uppercase; the gold underline grows from the centre on hover only
  - clicking ABOUT rolls the intro up and a (still empty) panel drops down; HOME drops the bar back down; `#about` in the URL opens About on load
  - phone width shows the hamburger and the slide-in menu
- [ ] **Step 5: Commit** `feat: home, section switching, phone menu, cursor`.

### Task 5: About and Resume sections

**Files:**
- Create: `components/site/AboutPanel.js`, `components/site/ResumePanel.js`
- Modify: `components/site/Portfolio.js` (mount the panels)

**Interfaces:**
- Consumes: `SiteContent.settings`, `.skills`, `.resume`, `.resumeEmpty`, `.cvUrl`, `.avatarUrl`; `SectionHead`, `BlockTitle`, `RichText`.

- [ ] **Step 1: Build `AboutPanel`** from the demo: the header from `section_headers.about`, the avatar card (no background), `about_title`, `about_body`, the facts list from `about_facts`, `about_body_2` (only if set), Download CV, `BlockTitle` skills, and the bars with `--v: {percent}%`. Re-add the `fill` class each time About opens, 250ms after the panel lands.
- [ ] **Step 2: Build `ResumePanel`:**
  - Education and Work go on the left, Achievements on the right.
  - A group with zero entries is not rendered.
  - If `resumeEmpty`, render only `<p>Resume coming soon.</p>` under the header.
  - Each entry has `title`, a `.date` tag from `date_label`, `.org` from `place`, the description, and `bullets` as `<ul>` when non-empty.
  - No "Sample" badges.
- [ ] **Step 3: Manually verify:** About matches the demo and the bars animate on every open. Resume shows "Resume coming soon." with the seed. After inserting one achievement row in Supabase and refreshing, only the Achievements column shows.
- [ ] **Step 4: Commit** `feat: about and resume sections`.

### Task 6: Projects section with slider and filters

**Files:**
- Create: `lib/slider.js`, `tests/slider.test.js`, `components/site/ProjectsPanel.js`, `components/site/ProjectSlider.js`

**Interfaces:**
- Consumes: `SiteContent.build`, `.projects`, `.filters`, `settings.build_more_text`, `settings.block_titles`.
- Produces: `perPage(trackWidth, cardStep, gap = 18) → int ≥ 1`, `pageCount(visibleCount, per) → int ≥ 1`, `pageIndex(scrollLeft, pageWidth, pages) → int in [0, pages-1]`.

- [ ] **Step 1: Write the failing tests:**
  - `perPage(1100, 372.67)` → `3`
  - `perPage(300, 276)` → `1`
  - `pageCount(9,3)` → `3`
  - `pageCount(4,3)` → `2`
  - `pageCount(0,3)` → `1`
  - `pageIndex(1118, 1118, 3)` → `1`
  - `pageIndex(99999, 1118, 3)` → `2`
  - `pageIndex(-10, 1118, 3)` → `0`
- [ ] **Step 2: Run** `npm test`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `lib/slider.js`.** `perPage` is `max(1, floor((trackWidth + gap + 1) / cardStep))`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Build `ProjectsPanel`:**
  - the header from `section_headers.projects`
  - "What I can build for you": `.build-grid` from `build`, then `.build-more` with `build_more_text` and an "Ask me about it" button that opens Contact
  - "Things I've built": only when `projects.length > 0`; filter buttons from `filters`, then `ProjectSlider`
- [ ] **Step 6: Build `ProjectSlider`** by porting the demo's slider and filter code, using `lib/slider.js` for the maths:
  - arrows disable at the ends
  - one dot per page, clickable, with `aria-current`
  - swipe via native scroll-snap
  - the filter animation: `.fading` for 0.2s, then `.enter` with `--i` stagger capped at 5; the dots fade with the cards
  - clicking the active filter does nothing
  - a card shows the image (when `image_url` is set) or the demo's placeholder, plus Live site / Code links only when their URLs are set
- [ ] **Step 7: Manually verify** with 9 projects inserted temporarily: 3 pages on desktop, 2 per page at 900px, 1 with swipe at phone width. Filters animate and reset to page 1. Hiding all Design projects removes the Design button.
- [ ] **Step 8: Commit** `feat: projects section with slider and filters`.

### Task 7: Contact section

**Files:**
- Create: `components/site/ContactPanel.js`

**Interfaces:**
- Consumes: `SiteContent.contacts.contact`, `.contacts.social`, `settings.section_headers.contact`, `settings.block_titles.social`, `settings.copyright_text`.

- [ ] **Step 1: Build `ContactPanel`** from the demo: `.cbox` boxes for `contact` rows (the label is the link), then `BlockTitle` social, then `.contact.social` cards for `social` rows (the whole card is an `<a target="_blank" rel="noopener">`), then the copyright. A group with no rows is not rendered.
- [ ] **Step 2: Manually verify:** it matches the demo. GitHub and LinkedIn appear only on Home. Every card gets the gold hover.
- [ ] **Step 3: Commit** `feat: contact section`.

### Task 8: Lightning

**Files:**
- Create: `lib/lightning/bolt.js`, `tests/bolt.test.js`, `components/site/Lightning.js`
- Modify: `components/site/Portfolio.js` (mount `<Lightning/>` once)

**Interfaces:**
- Consumes: the `portfolio:section` window event (Task 4), plus the DOM hooks the demo uses (`.hero-art`, `.portrait`, `.panel.show`, `.intro h1`, `.intro .lead`, `#mobile-menu .mobile-link`, `body.menu-open`).
- Produces: `boltPath(x1, y1, x2, y2, rough, rng = Math.random) → Array<[number, number]>`.

- [ ] **Step 1: Write the failing tests:**
  - `boltPath(0,0,100,0,.2)` has 65 points; the first is `[0,0]` and the last is `[100,0]`
  - with `rng = () => 0.5`, every point has `y === 0` (no displacement)
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement `boltPath`** by porting the demo's midpoint displacement: 6 rounds, offset halved each round, `rnd = a + rng()*(b-a)`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Build `Lightning`** (client) by porting every effect in the spec's "Lightning effects" list from the demo script. It renders `#glow`, `#sky`, `#flash` and `#fx`, plus `#zap` inside the hero via a portal or a ref passed from `HeroArt`. It cleans up all timers, listeners and rAF loops on unmount. When reduced motion is set, it draws only the static ring. Every canvas re-measures itself with a `ResizeObserver`, not only on window resize. Otherwise the avatar canvas measures 0×0 when the page opens on a section (e.g. `/#about`) and the ring never appears on Home. This bug was found and fixed in the demo on 2026-11-24.
- [ ] **Step 6: Manually verify** that opening `/#about` and then clicking HOME shows the avatar ring. Then verify each effect from the spec list: load strike, ring crackle (never over the avatar), storm behind text, click, mouse trail, scroll bolts from the cursor, finger trail (phone emulation), panel strike after the drop, and storm behind the phone-menu links. With reduced motion emulated in DevTools, there is no animation.
- [ ] **Step 7: Commit** `feat: lightning effects`.

### Task 9: Login and admin guard

**Files:**
- Create: `app/login/page.js`, `app/login/actions.js`, `proxy.js` (or `middleware.js`, see Step 2), `app/admin/layout.js`, `app/admin/page.js`, `components/admin/Sidebar.js`

**Interfaces:**
- Consumes: `createClient`, `getAdmin`, `requireAdmin` (Task 3).
- Produces: `signIn(prevState, formData) → {error?: string}` (redirects to `/admin` on success), `signOut()` (redirects to `/login`).

- [ ] **Step 1: Implement `signIn`.** It signs in with password. On error, or when the user isn't the admin (sign them out again), it returns `{error: 'Email or password is incorrect.'}`.
- [ ] **Step 2: Add the request guard** for `/admin/:path*`. It refreshes the Supabase session cookie and redirects to `/login` when there's no user. Use `proxy.js` exporting `proxy` if the installed Next major is ≥ 16, otherwise `middleware.js` exporting `middleware`.
- [ ] **Step 3: Build `/login`:** the contour background, "TOLA SANN", one lightning strike on load (reuse `boltPath`; none under reduced motion), and the email/password form with "Sign in".
- [ ] **Step 4: Build `admin/layout.js`.** It calls `requireAdmin()`, then renders the sidebar with "TOLA SANN" and the links Site text, Skills, Resume, What I build, Projects, Contacts, View site (opens `/` in a new tab) and Sign out. Build `admin/page.js` with the counts per table.
- [ ] **Step 5: Manually verify:**
  - `/admin` while signed out → `/login`
  - a wrong password → "Email or password is incorrect."
  - the right login → `/admin` with counts
  - Sign out → `/login`
  - a second, non-admin user in Supabase can't get in
- [ ] **Step 6: Commit** `feat: login and admin guard`.

### Task 10: Admin building blocks and validation

**Files:**
- Create: `lib/admin/schema.js`, `lib/admin/validate.js`, `lib/admin/crud.js`, `lib/storage.js`, `app/admin/actions.js`, `tests/validate.test.js`, `tests/crud.test.js`, `components/admin/{RowList,Drawer,Toast}.js`, `components/admin/fields/*.js`

**Interfaces:**
- Produces:
  - `ADMIN_SECTIONS: {skills|resume|build|projects|contacts: {table, title, addLabel, fields:[{name, label, type, options?}], rowTitle(row), rowMeta(row)}}`. The `type` is one of `text|textarea|icon|percent|image|select|toggle|bullets|url`.
  - `validate(section, values) → {ok:true, value} | {ok:false, errors:{[field]:string}}`
  - `validateUpload({size, type}, kind:'image'|'pdf') → string|null`
  - `swapOrder(rows, id, dir:'up'|'down') → [{id, sort_order}, {id, sort_order}] | []`
  - Server actions (each calls `requireAdmin()`, then `revalidatePath('/')` and `revalidatePath('/admin/'+section)`):
    - `saveRowAction(section, id|null, formData) → {ok, errors?}`
    - `deleteRowAction(section, id)`
    - `moveRowAction(section, id, dir)`
    - `setVisibleAction(section, id, visible)`
  - `uploadMedia(file, folder:'avatar'|'projects'|'files') → Promise<string>` (public URL; file name `${Date.now()}-${safeName}`)

- [ ] **Step 1: Write the failing tests** in `tests/validate.test.js`:
  - skills `{name:'', percent:'50'}` → `errors.name === 'Add a name.'`
  - `percent: '120'`, `'-5'` and `'abc'` → `errors.percent === 'Enter a number from 0 to 100.'`; `'85'` → `value.percent === 85`
  - projects `live_url: 'example.com'` → `errors.live_url === 'Enter a full link starting with https://'`; `''` is allowed (optional)
  - contacts `url: 'mailto:a@b.com'` and `'tel:+855…'` are accepted
  - resume `bullets: "One\n\n Two \n"` → `value.bullets` deep-equals `['One','Two']`; `kind: 'job'` → `errors.kind === 'Choose Education, Work experience or Achievement.'`
  - `validateUpload({size: 6*1024*1024, type:'image/png'}, 'image')` → `'Images must be 5 MB or smaller.'`; `{type:'image/gif'}` → `'Upload a JPG, PNG or WebP image.'`; pdf with `type:'image/png'` → `'Upload a PDF file.'`
- [ ] **Step 2: Write the failing tests** in `tests/crud.test.js`:
  - `swapOrder([{id:'a',sort_order:0},{id:'b',sort_order:1}], 'b', 'up')` → `[{id:'b',sort_order:0},{id:'a',sort_order:1}]`
  - moving the first row up → `[]`
  - moving the last row down → `[]`
- [ ] **Step 3: Run** `npm test`. Expected: FAIL.
- [ ] **Step 4: Implement** `schema.js`, `validate.js`, `crud.js` and `storage.js`. Required fields:
  - skills: name, percent
  - resume: kind, title
  - build: title
  - projects: title
  - contacts: kind, platform, url
  - `icon` fields must match `/^fa-(solid|regular|brands) fa-[a-z0-9-]+$/`, with the error `'Use a Font Awesome class like fa-brands fa-github.'`
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Build the shared UI:**
  - `RowList`: rows not cards; up/down buttons (the spec allows them instead of drag), a thumbnail or icon, the title, a visibility toggle, Edit; hidden rows dimmed; an empty state like "No projects yet. Add one to show it on your site."
  - `Drawer`: right-side panel; full-screen at ≤820px; the form; "Save changes"; Delete at the bottom with a `confirm()`
  - `Toast`: "Changes saved. Your site is updated."
  - Fields: Icon shows a live `<i>` preview; Percent shows a live bar; Image/Pdf upload through `uploadMedia`
  - Styling uses the site tokens, focus rings in gold, delete in `#f26d6d`
- [ ] **Step 7: Commit** `feat: admin building blocks and validation`.

### Task 11: Site text page

**Files:**
- Create: `app/admin/site/page.js`, `app/admin/site/actions.js`, `components/admin/fields/Facts.js`

**Interfaces:**
- Consumes: `requireAdmin`, `uploadMedia`, `validateUpload`, `DEFAULT_SETTINGS`.
- Produces: `saveSettings(prevState, formData) → {ok, errors?}` (updates row `id = 1`, revalidates `/`).

- [ ] **Step 1: Build the form,** grouped as on the site:
  - **Home:** first name, last name, role line (hint: "Wrap words in \*\*double stars\*\* to make them bold."), avatar upload, Open to work toggle, CV upload (PDF)
  - **About:** title, paragraph 1, paragraph 2, the facts editor (add/remove/reorder label–value rows)
  - **Section headers:** label + heading for About, Resume, Projects, Contact
  - **Block titles:** Skills, What I can build for you, Things I've built, Social media
  - **Projects:** "Need something else" line
  - **Footer:** copyright; **Site:** site title
- [ ] **Step 2: Implement `saveSettings`.** Validate uploads; empty text falls back to nothing (no crash), and `shapeContent` defaults cover the headers.
- [ ] **Step 3: Manually verify:**
  - change the last name → the homepage shows the new red surname within seconds of a refresh
  - `**bold**` in the role line renders bold
  - `<b>x</b>` shows literally
  - uploading a 6 MB image shows the size error
- [ ] **Step 4: Commit** `feat: admin site text page`.

### Task 12: List pages: skills, resume, what I build, projects, contacts

**Files:**
- Create: `app/admin/[section]/page.js`, `components/admin/CategoryManager.js`

**Interfaces:**
- Consumes: `ADMIN_SECTIONS`, `RowList`, `Drawer`, the actions from Task 10, `uploadMedia`.

- [ ] **Step 1: Build the generic page.** It returns `notFound()` for unknown sections, lists rows (admin sees hidden rows too), and renders Add / Edit in the `Drawer` from the `fields` definitions.
  - Resume groups its rows under Education / Work experience / Achievements headings.
  - Projects adds `CategoryManager` (add, rename, delete; deleting asks first and leaves those projects uncategorised) and fills the category select.
  - Contacts groups rows by Contact / Social media / Profile and includes the "Show under my name on the homepage" toggle.
- [ ] **Step 2: Manually verify,** for each section:
  - add → appears on `/`
  - edit → updates
  - hide → disappears from `/` but stays dimmed in the admin
  - move up/down → order changes on `/`
  - delete (confirm) → gone
  
  Also:
  - Resume: adding the first entry replaces "Resume coming soon."
  - Projects: a project image upload shows on its card
- [ ] **Step 3: Run** `npm test` and `node scripts/check-rls.mjs`. Expected: all pass.
- [ ] **Step 4: Commit** `feat: admin list pages`.

### Task 13: Deploy and final check

**Files:**
- Create: `docs/launch-checklist.md`

- [ ] **Step 1: Write `docs/launch-checklist.md`** covering every item in the spec's "Public site" and "Lightning effects" sections, the Review Focus list, reduced motion, and the phone/tablet/desktop widths. Each item is a checkbox the owner can tick.
- [ ] **Step 2: Deploy:** push `main`. Vercel builds with the three env vars. Confirm the production URL serves the site.
- [ ] **Step 3: Run the checklist on the production URL,** plus `node scripts/check-rls.mjs`. Expected: every box ticked, five PASS lines.
- [ ] **Step 4: Commit** `docs: launch checklist`.
