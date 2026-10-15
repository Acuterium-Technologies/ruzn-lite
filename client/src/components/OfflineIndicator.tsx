import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return navigator.onLine;
    }
    return true;
  });
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      const timer = setTimeout(() => setWasOffline(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm drop-shadow-2xl transition-all duration-300">
      {!isOnline ? (
        <Alert className="bg-amber-950/90 border-amber-600/60 text-amber-200 backdrop-blur-md">
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
          <AlertDescription className="mr-2 text-xs font-arabic-body">
            أنت غير متصل بالإنترنت حالياً. تعمل المنصة في الوضع المحلي الآمن.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-emerald-950/90 border-emerald-600/60 text-emerald-200 backdrop-blur-md">
          <Wifi className="h-4 w-4 text-emerald-400 shrink-0" />
          <AlertDescription className="mr-2 text-xs font-arabic-body">
            تمت استعادة الاتصال بالشبكة السيادية بنجاح.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
