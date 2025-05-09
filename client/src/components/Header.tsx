import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg 
              className="text-primary text-2xl mr-3 h-6 w-6"
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 8C20.6569 8 22 6.65685 22 5C22 3.34315 20.6569 2 19 2C17.3431 2 16 3.34315 16 5C16 6.65685 17.3431 8 19 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 13H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="font-heading font-bold text-xl text-primary">Adelphi Healthcare Pay Calculator</h1>
          </Link>
        </div>
        <nav className="mt-3 md:mt-0">
          <ul className="flex space-x-6 justify-center md:justify-end">
            <li>
              <Link href="/calculator" className={`flex items-center ${location === '/calculator' ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                <svg 
                  className="mr-2 h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 9C4 7.11438 4 6.17157 4.58579 5.58579C5.17157 5 6.11438 5 8 5H16C17.8856 5 18.8284 5 19.4142 5.58579C20 6.17157 20 7.11438 20 9V15C20 16.8856 20 17.8284 19.4142 18.4142C18.8284 19 17.8856 19 16 19H8C6.11438 19 5.17157 19 4.58579 18.4142C4 17.8284 4 16.8856 4 15V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Calculator
              </Link>
            </li>
            <li>
              <Link href="/history" className={`flex items-center ${location === '/history' ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                <svg 
                  className="mr-2 h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.05078 11.0002C3.27508 7.60383 5.52308 4.75983 8.64078 3.76683C11.7585 2.77383 15.1488 3.87083 17.0708 6.54883C18.9928 9.22683 18.9928 12.7732 17.0708 15.4512C15.1488 18.1292 11.7585 19.2262 8.64078 18.2332C5.52308 17.2402 3.27508 14.3962 3.05078 10.9992" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                History
              </Link>
            </li>
            <li>
              <Link href="/journal" className={`flex items-center ${location.startsWith('/journal') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                <svg 
                  className="mr-2 h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Journal
              </Link>
            </li>
            <li>
              <Link href="/account" className={`flex items-center ${location === '/account' ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                <svg 
                  className="mr-2 h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.9999 21C19.9999 17.13 16.4099 14 11.9999 14C7.58994 14 3.99994 17.13 3.99994 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Account
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
