"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: email }),
      });

      if (!res.ok) throw new Error("Failed to create job");

      const job = await res.json();
      router.push(`/upload/${job.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Accent Geometric Decorators (Optional) */}
      <div className="absolute top-10 right-10 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20" />
      <div className="absolute bottom-20 left-10 flex h-32 w-32 items-center justify-center rounded-sm bg-primary/10 rotate-12" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex w-full max-w-3xl flex-col items-center px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-white px-5 py-2 text-sm font-bold text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="uppercase tracking-widest text-xs">RabbitAI AI Cloud DevOps Engineer Assignment</span>
        </motion.div>

        <h1 className="mb-8 text-6xl font-black tracking-tighter text-foreground md:text-8xl leading-[1.1]">
          Instantly <br className="hidden md:block" />
          <span className="inline-block bg-primary text-white px-4 py-1 mx-[-0.25rem] transform -rotate-1 md:-rotate-2">Synthesize</span>
          {" "}Sales Data.
        </h1>
        
        <p className="mb-12 max-w-2xl text-lg font-medium text-foreground/70 md:text-2xl tracking-tight">
          Upload spreadsheets, sit back, and let AI distill thousands of rows into actionable executive briefings delivered straight to your inbox.
        </p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row p-2 bg-white rounded-full border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:translate-y-[2px] focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Input
            type="email"
            placeholder="Enter your email to start..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-14 bg-transparent border-0 text-foreground font-medium placeholder:text-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-6 sm:h-12"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full sm:h-12 sm:w-auto rounded-full bg-foreground text-background font-bold px-8 hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? "Initializing..." : "Proceed"}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </motion.form>
      </motion.div>

      {/* Footer Credits */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-center"
      >
        <div className="rounded-xl border-2 border-foreground bg-white px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-black text-foreground uppercase tracking-tight">
            Developed by <span className="bg-primary text-white px-1">Tushar Ruhela</span> (2311981546)
          </p>
          <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.2em] mt-1">
            Chitkara University
          </p>
        </div>
        <a 
          href="https://github.com/tushar-Ruhela" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-xs font-black text-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <span className="border-b-2 border-transparent group-hover:border-primary transition-all">tushar-Ruhela</span>
        </a>
      </motion.footer>
    </div>
  );
}
