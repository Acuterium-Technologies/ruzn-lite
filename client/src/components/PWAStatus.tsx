import { useEffect, useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return navigator.onLine;
    }
    return true;
  });
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker updates if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.update();
        }
      });
    }
    window.location.reload();
  };

  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2 drop-shadow-2xl">
      {!isOnline && (
        <Alert className="bg-amber-950/90 border-amber-600/60 text-amber-200 backdrop-blur-md">
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
          <AlertDescription className="mr-2 text-xs font-arabic-body">
            الوضع غير متصل بالشبكة. يتم حفظ الإجراءات محلياً.
          </AlertDescription>
        </Alert>
      )}

      {updateAvailable && (
        <Alert className="bg-primary/15 border-primary/40 text-primary-foreground backdrop-blur-md">
          <Download className="h-4 w-4 text-primary shrink-0" />
          <AlertDescription className="mr-2 flex items-center justify-between text-xs font-arabic-body w-full">
            <span>تحديث سيادي جديد متوفر للمنصة</span>
            <div className="flex gap-1.5 mr-2">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2 py-0 border-primary/50 text-primary hover:bg-primary/20"
                onClick={handleUpdate}
              >
                تحديث الآن
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-2 py-0 text-muted-foreground hover:bg-white/5"
                onClick={() => setUpdateAvailable(false)}
              >
                لاحقاً
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
