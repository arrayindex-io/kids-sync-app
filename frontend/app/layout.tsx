import './globals.css';
import { Inter, Montserrat } from 'next/font/google';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata = {
  title: 'Kids Sync App',
  description: 'Keep track of your kids\' activities and events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <div className="container mx-auto p-4 flex flex-col min-h-screen">
          <header className="mb-8">
            <Navigation />
          </header>
          <main className="flex-grow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};
