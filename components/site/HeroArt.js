import AvatarCircle from './AvatarCircle';

/** Right side of the homepage: avatar in the glowing circle, optional "Open to work" badge.
 *  #zap is the canvas the avatar lightning is drawn on (see Lightning). */
export default function HeroArt({ avatarUrl, zoom, y, openToWork }) {
  return (
    <div className="hero-art">
      <canvas id="zap" aria-hidden="true"></canvas>
      <AvatarCircle src={avatarUrl} zoom={zoom} y={y} />
      {openToWork && (
        <div className="badge">
          <i></i>Open to work
        </div>
      )}
    </div>
  );
}
