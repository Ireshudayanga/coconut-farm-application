// src/app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const farmer = document.cookie.includes('farmer_token=1');
    const owner = document.cookie.includes('owner_token=valid');

    if (owner) router.replace('/owner/dashboard');
    else if (farmer) router.replace('/farmer');
    else router.replace('/login-choice'); // new combined login selection page
  }, [router]);

  return null;
}
