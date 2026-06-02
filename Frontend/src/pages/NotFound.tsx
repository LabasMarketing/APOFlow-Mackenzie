import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MackenzieLogo } from '@/components/MackenzieLogo';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="absolute right-4 top-4">
        <MackenzieLogo />
      </div>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;