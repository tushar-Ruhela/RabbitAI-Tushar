import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     responses:
 *       200:
 *         description: List of all jobs
 *   post:
 *     summary: Create a new job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created
 *   delete:
 *     summary: Batch delete jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Jobs deleted successfully
 */
export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { recipientEmail } = await req.json();

        if (!recipientEmail || typeof recipientEmail !== 'string') {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }

        const job = await prisma.job.create({
            data: {
                recipientEmail,
                status: 'PENDING',
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Array of job IDs is required' }, { status: 400 });
        }

        await prisma.job.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return NextResponse.json({ message: 'Jobs deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting batch jobs:', error);
        return NextResponse.json({ error: 'Failed to delete jobs' }, { status: 500 });
    }
}
