"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-12">
        <h1 className="mb-8 text-center text-3xl font-bold text-slate-900">
          Sales Insight Automator - API Documentation
        </h1>
        <SwaggerUI url="/api/swagger" />
      </div>
    </div>
  );
}
