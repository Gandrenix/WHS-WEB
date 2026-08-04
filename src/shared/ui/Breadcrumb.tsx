// Migas de pan reutilizables con el motif "estrato" (segmentos biselados/aleteados).
// Componente genérico de UI compartida: no depende de ninguna feature ni entidad.
import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  /** Si se omite, el segmento se renderiza como texto plano (no navegable) */
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={className ? `${styles.container} ${className}` : styles.container}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.crumb} aria-current={isLast ? 'page' : undefined}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.crumbLink}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.crumbLink}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
