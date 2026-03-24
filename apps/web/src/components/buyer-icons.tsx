type IconProps = {
  className?: string;
};

export function LogoMark({ className = "h-12 w-12" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" fill="#E4F4FF" r="31" />
      <path
        d="M16 31C21.5 22 30 16.5 41 15C36.8 18.8 35.2 22.9 35.2 27C35.2 31.8 38.2 35.2 44 37.8C37.2 38.6 31.9 42 27.7 48.7C26.4 42.6 22.3 38.5 16 35.9C20.5 35.4 23.7 34 25.9 31.3C27.6 29.2 28.7 26.6 29.1 22.8C24.7 24.8 20.4 27.5 16 31Z"
        fill="#257ABC"
      />
      <path
        d="M18 41.2C24.1 38.6 28.6 39.7 32.5 44.2C34.5 41.6 36.6 40 38.8 39C41.9 37.6 45.4 37.5 49 38.6C43.3 41.8 39.6 45.8 37.7 50.7C34.1 46.5 27.4 43.1 18 41.2Z"
        fill="#57C6E2"
      />
      <path d="M22.3 24.3C24.8 22.7 27.5 22.1 30 22.4C29.5 24.7 28.5 26.4 26.9 27.9C25.5 29.3 23.5 30.3 21 30.8C21 28.6 21.5 26.5 22.3 24.3Z" fill="#57C6E2" />
    </svg>
  );
}

export function CartIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7.5H20L18.5 15.5H7.5L6 7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M6 7.5L5.2 5.2C4.95 4.48 4.27 4 3.5 4H2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <circle cx="8" cy="19" fill="currentColor" r="1.25" />
      <circle cx="17" cy="19" fill="currentColor" r="1.25" />
    </svg>
  );
}

export function HomeIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 10.5L12 4L19.5 10.5V19.25H14V14.5H10V19.25H4.5V10.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export function GridIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" width="6" x="4" y="4" />
      <rect height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" width="6" x="14" y="4" />
      <rect height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" width="6" x="4" y="14" />
      <rect height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" width="6" x="14" y="14" />
    </svg>
  );
}

export function ProfileIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 19.25C6.75 16.4 9 15 12 15C15 15 17.25 16.4 19 19.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}
