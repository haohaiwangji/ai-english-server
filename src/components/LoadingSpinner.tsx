'use client';

import { Spinner } from "@nextui-org/react";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <Spinner size="lg" color="primary"/>
        <p className="text-lg">正在分析图片...</p>
      </div>
    </div>
  );
} 