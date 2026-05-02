import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all tasks for dashboard
    let tasks;
    if (user.role === 'ADMIN') {
      tasks = await db.task.findMany({
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { dueDate: 'asc' }
      });
    } else {
      tasks = await db.task.findMany({
        where: { assigneeId: user.id },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { dueDate: 'asc' }
      });
    }
    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, description, projectId, assigneeId, dueDate } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
