import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let projects;
    if (user.role === 'ADMIN') {
      projects = await db.project.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Members can see all projects or maybe just ones they have tasks in? 
      // Let's allow them to see all projects for simplicity in "team management"
      projects = await db.project.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only admins can create projects.' }, { status: 403 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        ownerId: user.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
