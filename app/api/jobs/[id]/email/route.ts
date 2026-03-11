import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSummaryEmail } from '@/lib/services/mailer';

/**
 * @swagger
 * /api/jobs/{id}/email:
 *   post:
 *     summary: Forward job report to an email
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;

    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'COMPLETED' || !job.summary) {
            return NextResponse.json({ error: 'Job is not completed or has no summary' }, { status: 400 });
        }

        // Send Email
        await sendSummaryEmail(email, job.summary);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
