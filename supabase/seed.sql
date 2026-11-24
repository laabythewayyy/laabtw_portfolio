-- 4/4 Your real starting content (no samples). Run after storage.sql.
-- Safe to run again: it clears the lists first and rewrites the settings row.
-- Resume entries and extra projects start EMPTY on purpose. Add them in the dashboard.

delete from public.projects;
delete from public.project_categories;
delete from public.skills;
delete from public.build_items;
delete from public.contacts;

insert into public.site_settings (
  id, first_name, last_name, role_line, open_to_work,
  about_title, about_body, about_body_2, about_facts,
  section_headers, block_titles, build_more_text, copyright_text, site_title
) values (
  1, 'Tola', 'Sann',
  'I''m a **junior front-end developer** from Cambodia, building fast, clean and responsive websites.',
  true,
  'Front-end developer',
  'I''m a junior web developer who enjoys building clean, responsive and user-friendly websites. I''ve worked across the full stack, but I focus on front-end: bringing designs to life and making them feel smooth to use.',
  'I''m always improving my skills, learning new technologies, and building modern web applications.',
  '[{"label":"Name","value":"Tola Sann"},{"label":"Based in","value":"Cambodia"},{"label":"Role","value":"Junior front-end developer"},{"label":"Email","value":"suntola204@gmail.com"},{"label":"Focus","value":"React, Tailwind CSS"},{"label":"Freelance","value":"Available"}]'::jsonb,
  '{"about":{"label":"About","heading":"Learn more about me"},"resume":{"label":"Resume","heading":"Check my resume"},"projects":{"label":"Projects","heading":"My work"},"contact":{"label":"Contact","heading":"Let''s work together"}}'::jsonb,
  '{"skills":"Skills","build":"What I can build for you","built":"Things I''ve built","social":"Social media"}'::jsonb,
  'Need something else, like a web app or a dashboard? Tell me what you have in mind.',
  '© 2026 Laa Bytheway. All rights reserved.',
  'Tola Sann · Front-end developer'
)
on conflict (id) do update set
  first_name = excluded.first_name, last_name = excluded.last_name, role_line = excluded.role_line,
  open_to_work = excluded.open_to_work, about_title = excluded.about_title, about_body = excluded.about_body,
  about_body_2 = excluded.about_body_2, about_facts = excluded.about_facts,
  section_headers = excluded.section_headers, block_titles = excluded.block_titles,
  build_more_text = excluded.build_more_text, copyright_text = excluded.copyright_text,
  site_title = excluded.site_title;

-- starting percentages: change them anytime in the dashboard
insert into public.skills (name, percent, sort_order) values
  ('HTML / CSS', 90, 0), ('JavaScript', 80, 1), ('React', 80, 2), ('Tailwind CSS', 85, 3), ('Bootstrap', 80, 4),
  ('Laravel', 65, 5), ('PHP', 65, 6), ('Node.js', 55, 7), ('MySQL', 70, 8), ('Git / GitHub', 75, 9);

insert into public.build_items (title, icon, description, sort_order) values
  ('E-commerce websites', 'fa-solid fa-cart-shopping', 'An online store where customers can browse and buy your products.', 0),
  ('Business websites',   'fa-solid fa-store',         'A professional site for your shop or company, with your services and contact details.', 1),
  ('Landing pages',       'fa-solid fa-rocket',        'One focused page that gets visitors to sign up, buy or get in touch.', 2),
  ('Portfolio websites',  'fa-solid fa-id-badge',      'A personal site that shows who you are and the work you have done.', 3);

insert into public.project_categories (name, sort_order) values
  ('Website', 0), ('React app', 1), ('Design', 2);

insert into public.projects (title, description, category_id, sort_order) values
  ('My Portfolio', 'A responsive personal site with smooth animations and a clean layout.',
   (select id from public.project_categories where name = 'Website'), 0);

insert into public.contacts (kind, platform, icon, label, url, show_in_hero, sort_order) values
  ('profile', 'GitHub',    'fa-brands fa-github',      'GitHub',               'https://github.com/laabythewayyy',            true,  0),
  ('profile', 'LinkedIn',  'fa-brands fa-linkedin-in', 'LinkedIn',             'https://linkedin.com/in/tola-sann-330441340', true,  1),
  ('contact', 'Email',     'fa-regular fa-envelope',   'suntola204@gmail.com', 'mailto:suntola204@gmail.com',                 true,  2),
  ('contact', 'WhatsApp',  'fa-brands fa-whatsapp',    '+855 96 352 7860',     'https://wa.me/855963527860',                  false, 3),
  ('contact', 'Telegram',  'fa-brands fa-telegram',    '@laabythewayyy',       'https://t.me/laabythewayyy',                  true,  4),
  ('social',  'Instagram', 'fa-brands fa-instagram',   '@_imbarryallen',       'https://instagram.com/_imbarryallen',         false, 5),
  ('social',  'Facebook',  'fa-brands fa-facebook-f',  'Tola Sann',            'https://facebook.com/laabytheway.yahoo',      false, 6),
  ('social',  'TikTok',    'fa-brands fa-tiktok',      '@laabythewayyy',       'https://tiktok.com/@laabythewayyy',           false, 7),
  ('social',  'YouTube',   'fa-brands fa-youtube',     '@laabythewayyyy',      'https://youtube.com/@laabythewayyyy',         false, 8);
