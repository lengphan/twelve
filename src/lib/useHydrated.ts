import { useEffect, useState } from 'react';
import { useStore } from '@/store';

/** True once saved data has loaded from the phone, so we never flash onboarding by mistake. */
export function useHydrated() {
  const [ready, setReady] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setReady(true));
    setReady(useStore.persist.hasHydrated());
    return unsub;
  }, []);
  return ready;
}
