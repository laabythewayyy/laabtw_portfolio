# Launch checklist

Run this on the **live (production) URL** after Vercel deploys. Tick each box. Anything that fails: note it and tell the builder.

Check at three widths: **phone** (about 375px), **tablet** (about 768px) and **desktop** (1280px or wider). In Chrome: right-click → Inspect → the phone/tablet icon.

## 1. Security (do first)

- [ ] `node scripts/check-rls.mjs` prints only PASS lines (6 of them), run with the production Supabase values.
- [ ] Opening `/admin` in a private window (signed out) sends you to `/login`.
- [ ] A wrong password on `/login` shows an error and does not open the dashboard.
- [ ] Your real password signs you in; **Sign out** brings you back to the login page.
- [ ] On Vercel, **Settings → Environment Variables** has only the three values (Supabase URL, publishable/anon key, admin user id). No secret / service_role key anywhere.

## 2. Home and navigation

- [ ] Menu reads HOME · ABOUT · RESUME · PROJECTS · CONTACT, uppercase with letter spacing.
- [ ] "Tola" is white, "Sann" is red; the role line shows your **bold** words.
- [ ] "View my projects" opens Projects; "Download CV" downloads your CV (or the default one).
- [ ] GitHub / LinkedIn / Telegram / Email icons open the right places.
- [ ] Avatar sits in the circle with the glowing red ring and the "Open to work" badge (if switched on).
- [ ] Clicking a section: the homepage rolls up into the slim "TOLA SANN" top bar, then the panel drops in.
- [ ] Switching sections: the old panel lifts away, the new one drops in. HOME brings the full homepage back.
- [ ] The address bar shows `#about`, `#resume` etc.; opening the URL with a hash opens that section.
- [ ] In the top bar, the name lines up with the panel's left edge and the menu with its right edge.
- [ ] **Phone:** three-line hamburger with no circle; it collapses when open; the full-screen menu slides in from the right with big uppercase links; the avatar sits above the text.

## 3. Sections

- [ ] **About:** avatar card, title, bio, info list, Download CV, and skill bars that fill each time About opens.
- [ ] **About, below 1000px:** the info list is one column and no word breaks in the middle.
- [ ] **Resume:** Education and Work experience on the left, Achievements on the right; each entry has title, date tag, place, and text or bullets.
- [ ] **Projects:** "What I can build for you" columns and the "Need something else?" line linking to Contact.
- [ ] **Projects slider:** 3 cards per page on desktop, 2 on tablet, 1 with swipe on phones; square arrows and dots work.
- [ ] **Filters:** chosen filter has red text; cards fade out, swap, and rise back one after another; slider returns to page 1.
- [ ] **Contact:** Email / WhatsApp / Telegram boxes; social cards 4 across on wide screens, 2 × 2 below 1200px, stacked on phones.
- [ ] Handles and links stay on one line and never break mid-word.
- [ ] Copyright line shows.
- [ ] Section headers: small grey label, 120px glowing red line, big heading. Block titles have the short red line too.

## 4. Look and feel

- [ ] Red contour background over black, with the soft red glow on the right.
- [ ] Everything inside the section panels has square corners; homepage buttons are slightly rounded.
- [ ] Every hover is gold border/text with a soft glow and **no background fill**. Menu links grow a gold underline from the centre.
- [ ] Scrollbar is thin, square, red, turns gold on hover, and has **no arrow buttons**.
- [ ] Mouse cursor is a solid white dot that stays the same over links and only shrinks briefly on click.

## 5. Lightning

- [ ] Page load: a bolt strikes the avatar circle with a flash.
- [ ] Gold arcs crackle around the avatar ring and never cross the avatar.
- [ ] Background storm: a bolt every few seconds, with the gold contour glow where it lands.
- [ ] Click / tap: a bolt falls onto the point with sparks.
- [ ] Mouse / finger trail crackles; a fast flick throws sparks.
- [ ] Scrolling shoots bolts in the scroll direction plus one down the side.
- [ ] Opening a section strikes the panel's top edge.
- [ ] Phone menu: the storm plays behind the links.
- [ ] **Reduced motion:** with Windows **Settings → Accessibility → Visual effects → Animation effects** turned off, there is no lightning at all and the site still works.

## 6. Tricky content (the dashboard should handle these)

- [ ] Type `<script>alert(1)</script>` in the short description → it shows as plain text, no popup. Then change it back.
- [ ] Type `a **b` (one unclosed pair of stars) → shows literally, nothing breaks. Change it back.
- [ ] Skill level can't be saved as 120, -5 or abc; a link without `https://` is rejected with a message.
- [ ] Hide a project → it disappears from the live site. If every project in a category is hidden, that filter button disappears too. Show it again afterwards.
- [ ] Removing the avatar or CV falls back to the default image / PDF.
- [ ] A resume group with no entries is hidden; with no resume at all the page says "Resume coming soon."
- [ ] Every change saved in the dashboard shows on the live site after a refresh.
