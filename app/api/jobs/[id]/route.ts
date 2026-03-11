import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a single job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;

    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        await prisma.job.delete({
            where: { id: jobId }
        });

        return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting job:', error);
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }
}
