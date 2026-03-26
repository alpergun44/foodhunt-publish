/**
 * FoodHunt — Social Proof Component
 * Shows "X people played today" counter
 */
import { useState, useEffect } from 'react';
import { api } from '../../api';

export function SocialProof() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getSocialStats()
      .then((data: any) => setMessage(data.message || ''))
      .catch(() => {});
  }, []);

  if (!message) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4
                    bg-white/5 rounded-full text-white/60 text-sm">
      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      {message}
    </div>
  );
}
