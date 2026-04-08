'use client'

/**
 * MobileNav — client component for hamburger menu on tablet/mobile.
 * Uses shadcn NavigationMenu (Radix) for accessible nav toggle with
 * focus management, keyboard navigation, and proper aria attributes.
 * Shown below lg breakpoint (≈991px source breakpoint).
 */
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import type { NavLinkItem } from './CompetitionNav.render'

interface MobileNavProps {
  navLinks: NavLinkItem[]
  ctaText: string
  ctaLink: string
  primaryColor: string
}

export function MobileNav({
  navLinks,
  ctaText,
  ctaLink,
  primaryColor,
}: MobileNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className="rounded-lg border border-gray-200 bg-white p-3 h-auto"
          >
            {/* Hamburger icon — ChevronDown is added by NavigationMenuTrigger */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-0">
              <path d="M0 0H18V2H0V0ZM0 5H18V7H0V5ZM0 10H18V12H0V10Z" fill="currentColor" />
            </svg>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="right-0 left-auto w-[260px]">
            <div className="py-2">
              {navLinks.map((link, i) => (
                <NavigationMenuLink
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block no-underline px-5 py-3 hover:bg-gray-50"
                  style={{ color: '#000', fontSize: '16px', fontWeight: 500 }}
                >
                  {link.label}
                </NavigationMenuLink>
              ))}
              {ctaText && (
                <div className="px-4 pt-2 pb-2">
                  <NavigationMenuLink
                    href={ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block no-underline text-white font-bold text-center w-full"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      lineHeight: '24px',
                    }}
                  >
                    {ctaText}
                  </NavigationMenuLink>
                </div>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
