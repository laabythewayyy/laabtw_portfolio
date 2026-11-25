import { photoFit } from '@/lib/content';

/** Right side of the homepage: avatar in the glowing circle, optional "Open to work" badge.
 *  #zap is the canvas the avatar lightning is drawn on (see Lightning). */
export default function HeroArt({ avatarUrl, openToWork }) {
  return (
    <div className="hero-art">
      <canvas id="zap" aria-hidden="true"></canvas>
      <div className="portrait" aria-hidden="true">
        <span className="ring"></span>
        <div className="frame" data-fit={photoFit(avatarUrl)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar may be an uploaded Supabase URL */}
          <img src={avatarUrl} alt="" fetchPriority="high" decoding="async" />
        </div>
      </div>
      {openToWork && (
        <div className="badge">
          <i></i>Open to work
        </div>
      )}
    </div>
  );
}
