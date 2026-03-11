import { createSwaggerSpec } from "next-swagger-doc";
import { NextResponse } from "next/server";

export const GET = async () => {
    const spec = createSwaggerSpec({
        apiFolder: "./app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Sales Insight Automator API",
                version: "1.0",
                description: "AI-powered sales analysis engine.",
            },
            servers: [
                {
                    url: "https://rabbitai-tushar.vercel.app",
                    description: "Production Server",
                },
                {
                    url: "http://localhost:3000",
                    description: "Local Development Server",
                },
            ],
        },
    });

    return NextResponse.json(spec);
};
