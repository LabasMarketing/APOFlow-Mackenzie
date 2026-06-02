import { forwardRef } from 'react';
import { NavLink as RouterNavLink, type NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive, isPending }) =>
        cn(
          'navlink-sidebar',
          className,
          isActive && (activeClassName ?? 'selected-invert'),
          isPending && pendingClassName
        )
      }
      {...props}
    />
  ),
);

NavLink.displayName = 'NavLink';

export { NavLink };
