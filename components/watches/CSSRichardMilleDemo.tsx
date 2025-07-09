'use client';

import React from 'react';
import CSSRichardMille from './CSSRichardMille';

export default function CSSRichardMilleDemo() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          CSS Richard Mille RM 75-01
        </h1>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          A pure CSS implementation of the iconic Richard Mille watch with functional chronograph,
          power reserve indicator, and smooth hand movements. Click the crown to wind the watch,
          and use the pushers to control the chronograph.
        </p>
        
        <CSSRichardMille />
        
        <div className="mt-8 text-gray-500 text-sm">
          <p>Interactive Features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Click the crown (right side) to wind the power reserve</li>
            <li>• Top pusher: Start/Stop chronograph</li>
            <li>• Bottom pusher: Reset chronograph</li>
            <li>• Live time display with smooth second hand</li>
          </ul>
        </div>
      </div>
    </div>
  );
}