import { NextResponse } from 'next/server';
import { parseFile } from '@/lib/services/dataParser';
import { generateSummary, generateAnalysisTags } from '@/lib/services/llm';
import { sendSummaryEmail } from '@/lib/services/mailer';
import prisma from '@/lib/prisma';


/**
 * @swagger
 * /api/jobs/{id}/upload:
 *   post:
 *     summary: Upload sales data and trigger AI processing
 *     description: Parses CSV/Excel data, detects anomaly tags, and generates an executive summary.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Processing started successfully
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;
    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Read the file as buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Update job to processing
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'PROCESSING', fileName: file.name, progressStep: 'Starting processing...' }
        });

        // Start background processing
        processJobInBackground(jobId, buffer, file.type, job.recipientEmail).catch(console.error);

        return NextResponse.json({ message: 'Upload successful, processing started', job: { id: jobId, status: 'PROCESSING' } }, { status: 200 });
    } catch (error) {
        console.error('File Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

async function processJobInBackground(jobId: string, buffer: Buffer, fileType: string, recipientEmail: string) {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const updateProgress = async (step: string) => {
        await prisma.job.update({ where: { id: jobId }, data: { progressStep: step } }).catch(console.error);
    };

    try {
        await updateProgress("Analyzing data format...");
        await sleep(2000); // Artificial delay for UX
        // 1. Parse File
        const parsedData = parseFile(buffer, fileType);

        await updateProgress("Figuring out anomalies & generating insights...");
        // LLM generation naturally takes a few seconds
        // 2. Generate summary via LLM
        const summaryStr = await generateSummary(parsedData);

        await updateProgress("Finalizing & detecting trends...");
        const tags = await generateAnalysisTags(parsedData);
        await sleep(1000); // Artificial delay for UX

        await updateProgress("Sending summary email...");
        // 3. Send Email
        await sendSummaryEmail(recipientEmail, summaryStr);
        await sleep(1500); // Wait a moment before declaring complete

        await updateProgress("Job completed");
        // 4. Update database
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'COMPLETED', summary: summaryStr, analysisTags: tags }
        });
    } catch (error) {
        console.error('Background Processing Error:', error);
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'FAILED' }
        }).catch(console.error);
    }
}
