"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, FileText, Calendar, CheckCircle, Clock, ChevronDown, Send, Loader2, Trash2, Filter, Download, CheckSquare, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Job = {
  id: string;
  recipientEmail: string;
  fileName: string | null;
  status: "PENDING" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progressStep: string | null;
  summary: string | null;
  analysisTags: string[];
  createdAt: string;
};

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");

  // Email sending state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [sendingJobId, setSendingJobId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Batch Selection
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState<string | null>(null);

  // Ask Rabbit State
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const toggleExpand = (id: string) => {
    if (expandedJobId !== id) {
      fetchChat(id);
    }
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  const fetchChat = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => ({ ...prev, [jobId]: data }));
      }
    } catch (e) { console.error(e); }
  };

  const sendChatMessage = async (jobId: string) => {
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: chatInput };
    setChatMessages(prev => ({ ...prev, [jobId]: [...(prev[jobId] || []), userMsg] }));
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content })
      });
      if (res.ok) {
        const aiMsg = await res.json();
        setChatMessages(prev => ({ ...prev, [jobId]: [...(prev[jobId] || []), aiMsg] }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const openDeleteModal = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // Prevents accordion from opening
    setJobToDelete(jobId);
    setIsDeleteModalOpen(true);
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== jobToDelete));
        setIsDeleteModalOpen(false);
      } else {
        console.error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  const openEmailModal = (jobId: string) => {
    setSendingJobId(jobId);
    setTargetEmail("");
    setEmailStatus("idle");
    setIsEmailModalOpen(true);
  };

  const sendReportEmail = async () => {
    if (!sendingJobId || !targetEmail) return;
    
    setIsSending(true);
    setEmailStatus("idle");

    try {
      const res = await fetch(`/api/jobs/${sendingJobId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!res.ok) throw new Error("Failed to send");
      
      setEmailStatus("success");
      setTimeout(() => setIsEmailModalOpen(false), 2000);
    } catch (error) {
      console.error(error);
      setEmailStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const toggleJobSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedJobs(prev => prev.includes(id) ? prev.filter(jId => jId !== id) : [...prev, id]);
  };

  const deleteSelected = async () => {
    if (selectedJobs.length === 0) return;
    setIsBatchDeleting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedJobs })
      });
      if (res.ok) {
        setJobs(jobs.filter(j => !selectedJobs.includes(j.id)));
        setSelectedJobs([]);
      } else {
        console.error("Failed to delete batch");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const exportPDF = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (!job.summary) return;
    
    setIsExportingPDF(job.id);
    const formatDate = new Date(job.createdAt).toISOString().split('T')[0];
    const filename = `RabbitAI_Report_${formatDate}_${job.id.substring(0,8)}.pdf`;
    
    const container = document.createElement('div');
    
    // We isolate the summary HTML from Tailwind global base styles 
    // to prevent html2canvas from picking up unsupported 'oklch'/'lab' variables from the root DOM.
    // Ensure absolutely NO shorthand colors or custom variables are inside this raw HTML tree.
    const cleanSummary = job.summary
      .replace(/<([a-z][a-z0-9]*)\b[^>]*>/gi, '<$1>') // Strip all classes from the raw HTML output
      .replace(/<h1/g, '<h1 style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #000000;"')
      .replace(/<h2/g, '<h2 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #000000;"')
      .replace(/<h3/g, '<h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #000000;"')
      .replace(/<p/g, '<p style="font-size: 12px; line-height: 1.5; margin-bottom: 12px; color: #222222;"')
      .replace(/<ul/g, '<ul style="font-size: 12px; margin-left: 20px; margin-bottom: 12px; color: #222222;"')
      .replace(/<li/g, '<li style="margin-bottom: 4px;"')
      .replace(/<strong/g, '<strong style="font-weight: bold; color: #000000;"');

    container.innerHTML = `
      <div style="font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #111111; background-color: #ffffff;">
        <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; color: #000000;">Analysis Report</h1>
        <p style="font-weight: bold; font-size: 12px; margin-bottom: 30px; color: #666666;">
          Generated via RabbitAI | Target: ${job.recipientEmail} | Date: ${new Date(job.createdAt).toLocaleDateString()}
        </p>
        <div style="border-top: 2px solid #000000; padding-top: 20px;">
          ${cleanSummary}
        </div>
      </div>
    `;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: 15,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(container).save();
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsExportingPDF(null);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000); // Poll every 2s for responsive progress updates
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (dateFilter === "all") return true;
    const jobDate = new Date(job.createdAt).toDateString();
    const today = new Date().toDateString();
    return jobDate === today;
  });

  const getStatusBadge = (job: Job) => {
    switch (job.status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 border-2 border-green-800 shadow-[2px_2px_0px_0px_rgba(22,101,52,1)] hover:bg-green-200 hover:shadow-none translate-y-0 hover:translate-y-[2px] transition-all"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-primary/10 text-primary border-2 border-primary shadow-[2px_2px_0px_0px_currentColor] hover:bg-primary/20 hover:shadow-none translate-y-0 hover:translate-y-[2px] transition-all"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> {job.progressStep || "Processing..."}</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="border-2 border-destructive shadow-[2px_2px_0px_0px_currentColor]">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-white text-foreground border-2 border-foreground/30 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12 text-foreground font-sans">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-4 border-foreground pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Insights Dashboard</h1>
            <p className="mt-2 text-foreground/70 font-medium">Monitor all automated AI summarization tasks.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
               onClick={() => {
                 if (selectedJobs.length === filteredJobs.length && filteredJobs.length > 0) {
                   setSelectedJobs([]);
                 } else {
                   setSelectedJobs(filteredJobs.map(j => j.id));
                 }
               }}
               className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 border-foreground rounded-full bg-white text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95"
            >
              <CheckSquare className="h-4 w-4" /> {selectedJobs.length === filteredJobs.length && filteredJobs.length > 0 ? "Deselect All" : "Select All"}
            </button>
            <div className="flex items-center rounded-full border-2 border-foreground bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <button
                onClick={() => setDateFilter("today")}
                className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${dateFilter === "today" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"}`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter("all")}
                className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${dateFilter === "all" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"}`}
              >
                All Time
              </button>
            </div>
            <button
              onClick={fetchJobs}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[4px] active:shadow-none"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredJobs.length === 0 && !loading ? (
             <Card className="flex h-40 flex-col items-center justify-center border-2 border-dashed border-foreground/30 bg-transparent shadow-none">
                <p className="text-foreground/60 font-medium font-mono">No processing jobs found {dateFilter === 'today' ? 'today' : ''}.</p>
             </Card>
          ) : (
            filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`flex flex-col border-2 border-foreground bg-white transition-all overflow-hidden ${expandedJobId === job.id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}>
                  <div 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 cursor-pointer bg-white"
                    onClick={() => toggleExpand(job.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={(e) => toggleJobSelection(e, job.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-foreground transition-all cursor-pointer mr-2 ${selectedJobs.includes(job.id) ? 'bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white' : 'bg-white hover:bg-gray-100 text-transparent hover:text-foreground/30'}`}
                      >
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <FileText className="h-6 w-6 text-foreground" />
                      </div>
                        <div className="break-all">
                          <h3 className="font-bold text-foreground text-lg tracking-tight">{job.fileName || "Awaiting file..."}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                             <p className="text-sm border border-foreground/10 bg-foreground/5 inline-block px-2 py-0.5 rounded text-foreground/70 font-mono">{job.recipientEmail}</p>
                             {job.analysisTags?.map((tag, tIdx) => (
                               <Badge key={tIdx} className="bg-secondary text-foreground border-2 border-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase text-[10px] font-black h-5">
                                 {tag}
                               </Badge>
                             ))}
                          </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 min-w-[250px] justify-between">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground/50 uppercase tracking-widest">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(job)}
                        <button 
                          onClick={(e) => openDeleteModal(e, job.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-[0.4rem] border-2 border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(254,202,202,1)] hover:shadow-none hover:translate-y-[1px]"
                          title="Delete Job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground bg-white transition-transform ${expandedJobId === job.id ? 'rotate-180 bg-foreground' : ''}`}>
                            <ChevronDown className={`h-4 w-4 ${expandedJobId === job.id ? 'text-white' : 'text-foreground'}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedJobId === job.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t-2 border-foreground p-8 bg-[#F5F5F3] overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-widest bg-yellow-300 inline-block px-2 py-1 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Analysis Summary</h4>
                        {job.status === 'COMPLETED' && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => exportPDF(e, job)}
                              disabled={isExportingPDF === job.id}
                              className="flex items-center gap-2 rounded-full border-2 border-foreground bg-secondary px-4 py-2 text-xs font-bold text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95 disabled:opacity-50"
                            >
                              {isExportingPDF === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} 
                              Download PDF
                            </button>
                            <button
                              onClick={() => openEmailModal(job.id)}
                              className="flex items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-4 py-2 text-xs font-bold text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all hover:shadow-none active:scale-95"
                            >
                              <Send className="h-3.5 w-3.5" /> Forward Report
                            </button>
                          </div>
                        )}
                      </div>
                      {job.summary ? (
                        <div 
                          className="text-foreground text-base [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-foreground [&>h1]:mt-6 [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-5 [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-4 [&>h3]:mb-1 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>li]:mb-2 [&>strong]:text-foreground [&>strong]:font-bold bg-white p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg"
                          dangerouslySetInnerHTML={{ __html: job.summary }}
                        />
                      ) : (
                        <p className="text-sm text-foreground/50 font-medium italic p-4 border-2 border-dashed border-foreground/20 rounded-lg">No summary available yet. The file might still be processing.</p>
                      )}

                      {/* Ask Rabbit Section */}
                      <div className="mt-12 bg-white border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden flex flex-col">
                        <div className="bg-foreground p-4 flex items-center justify-between">
                          <h5 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             <Sparkles className="h-3 w-3 text-secondary" /> Ask Rabbit AI
                          </h5>
                          <span className="text-[10px] text-white/50 font-bold uppercase">Data Q&A</span>
                        </div>
                        
                        <div className="p-6 max-h-[300px] overflow-y-auto space-y-4 bg-gray-50/50">
                          {chatMessages[job.id]?.length === 0 && !isTyping && (
                            <p className="text-center text-xs text-foreground/40 font-bold uppercase tracking-tight py-4">Ask a question about this sales report...</p>
                          )}
                          {chatMessages[job.id]?.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-3 rounded-lg border-2 border-foreground text-sm font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-foreground'}`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                             <div className="flex justify-start">
                               <div className="p-3 rounded-lg border-2 border-foreground bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                 <Loader2 className="h-4 w-4 animate-spin text-primary" />
                               </div>
                             </div>
                          )}
                        </div>

                        <div className="p-4 border-t-2 border-foreground bg-white flex gap-2">
                           <input 
                             type="text"
                             className="flex-1 bg-white border-2 border-foreground rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-0 shadow-inner"
                             placeholder="Ex: What was the top product in April?"
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(job.id)}
                           />
                           <button 
                             onClick={() => sendChatMessage(job.id)}
                             disabled={!chatInput.trim() || isTyping}
                             className="bg-primary text-white font-black uppercase text-[10px] tracking-widest px-4 py-2 border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                           >
                             Ask
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="border-4 border-foreground bg-background text-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:max-w-[450px] p-8 !rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Forward Analysis Report</DialogTitle>
            <DialogDescription className="text-foreground/70 font-medium mt-2">
              Enter the email address where you would like to send this generated sales summary.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-foreground tracking-wide uppercase">
                Recipient Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                className="flex h-12 w-full rounded-none border-2 border-foreground bg-white px-4 py-2 text-base font-medium text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
            {emailStatus === "success" && (
              <p className="text-sm font-bold text-green-700 bg-green-100 border-2 border-green-700 p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(21,128,61,1)]"><CheckCircle className="h-5 w-5"/> Email sent successfully!</p>
            )}
            {emailStatus === "error" && (
              <p className="text-sm font-bold text-red-700 bg-red-100 border-2 border-red-700 p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(185,28,28,1)]">Failed to send email. Check logs.</p>
            )}
          </div>
          <DialogFooter className="sm:justify-between flex-row-reverse">
            <button
              onClick={sendReportEmail}
              className="flex items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary/90 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              disabled={!targetEmail || isSending || emailStatus === "success"}
            >
              {isSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send Report</>}
            </button>
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-foreground/70 hover:text-foreground transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="border-4 border-foreground bg-background text-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:max-w-[400px] p-8 !rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-red-600">Delete Job?</DialogTitle>
            <DialogDescription className="text-foreground/70 font-medium mt-2">
              This action cannot be undone. This will permanently delete the uploaded file record and its generated summary.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between flex-row-reverse mt-4">
            <button
              onClick={deleteJob}
              className="flex items-center justify-center gap-2 border-2 border-red-600 bg-red-500 px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] transition-all hover:bg-red-600 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="h-4 w-4" /> Delete</>}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-foreground/70 hover:text-foreground transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch Actions Bar */}
      {selectedJobs.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-full border-4 border-foreground bg-white px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <span className="text-lg font-black shrink-0 text-foreground">{selectedJobs.length} item{selectedJobs.length > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedJobs([])}
              className="px-4 py-2 text-sm font-bold text-foreground/60 hover:text-foreground shrink-0"
            >
              Clear
            </button>
            <button
              onClick={deleteSelected}
              disabled={isBatchDeleting}
              className="flex items-center shrink-0 gap-2 rounded-full border-2 border-red-600 bg-red-500 px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] transition-all hover:bg-red-600 hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
            >
              {isBatchDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
