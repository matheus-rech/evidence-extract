import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/documents', label: 'Documents' },
  { href: '/reconciliation', label: 'Reconcile' },
  { href: '/harmonization', label: 'Harmonize' },
  { href: '/admin/active-learning', label: 'Learning' }
];

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar" aria-label="Evidence Extract workspace">
        <div className="brand-lockup">
          <div className="brand-eyebrow">Evidence Extract</div>
          <div className="brand-mark">Review desk</div>
          <p className="muted">PDF evidence, structured extraction, and reviewer reconciliation in one provenance-first workspace.</p>
        </div>
        <nav className="workspace-nav" aria-label="Primary workspace navigation">
          {navItems.map((item, index) => (
            <Link href={item.href} key={item.href}>
              <span>{item.label}</span>
              <span className="nav-index">{String(index + 1).padStart(2, '0')}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="eyebrow">Reviewer mode</div>
          <p className="fine-print">Attach every claim to a quote and bounding box before saving the extraction payload.</p>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
