import HamburgerMenu from '@/components/HamburgerMenu';
import { SECTIONS } from './sections';

/** The public site's phone menu. The links carry data-s, so Portfolio switches the section. */
export default function PhoneMenu() {
  return (
    <HamburgerMenu>
      {SECTIONS.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} data-s={s.id} className="mobile-link">
            {s.label}
          </a>
        </li>
      ))}
    </HamburgerMenu>
  );
}
