import React from 'react';

export default function WhiteSection() {
  return (
    <section className="bg-white text-black min-h-screen rounded-t-[3rem] shadow-2xl -mt-10 p-12 md:p-24">
      <div className="max-w-6xl mx-auto">
        {/* Placeholder Content */}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
          Built for the future of logistics.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg text-gray-600">
          <p>
            This section will contain your dashboard, cargo constraints, and final forecast metrics. As you scroll down, the dark theme neatly tucks away to present a clean workspace for data visualization.
          </p>
          <div className="bg-gray-100 p-8 rounded-2xl h-64 flex items-center justify-center border border-gray-200">
            [ Dashboard Analytics Placeholder ]
          </div>
        </div>
      </div>
    </section>
  );
}