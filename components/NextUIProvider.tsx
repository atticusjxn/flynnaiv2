'use client';

import { NextUIProvider as NextUIProviderBase } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface NextUIProviderProps {
  children: ReactNode;
}

export function NextUIProvider({ children }: NextUIProviderProps) {
  const router = useRouter();

  return (
    <NextUIProviderBase navigate={router.push}>{children}</NextUIProviderBase>
  );
}
