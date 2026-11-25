import { avatarFrame } from '@/lib/content';

/**
 * The glowing circle with the avatar inside. Used on the homepage and as the dashboard's live preview,
 * so both always look the same. `name` helps tell a photo from a cut-out when `src` is a local preview.
 */
export default function AvatarCircle({ src, name, zoom = null, y = null, className = 'portrait' }) {
  const f = avatarFrame(name || src, zoom, y);
  return (
    <div className={className} aria-hidden="true">
      <span className="ring"></span>
      <div className="frame" data-fit={f.fit} style={{ '--zoom': f.zoom, '--y': f.y }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- avatar may be an uploaded Supabase URL */}
        <img src={src} alt="" fetchPriority="high" decoding="async" />
      </div>
    </div>
  );
}
