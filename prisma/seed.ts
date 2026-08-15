import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const manager1 = await prisma.user.upsert({
    where: { email: 'alex.manager@example.com' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'alex.manager@example.com',
      password: passwordHash,
      role: Role.MANAGER,
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'sarah.manager@example.com' },
    update: {},
    create: {
      name: 'Sarah Jenkins',
      email: 'sarah.manager@example.com',
      password: passwordHash,
      role: Role.MANAGER,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'sara.dervashi@example.com' },
    update: {},
    create: {
      name: 'Sara Dervashi',
      email: 'sara.dervashi@example.com',
      password: passwordHash,
      role: Role.MEMBER,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: passwordHash,
      role: Role.MEMBER,
    },
  });

  const member3 = await prisma.user.upsert({
    where: { email: 'emily.clark@example.com' },
    update: {},
    create: {
      name: 'Emily Clark',
      email: 'emily.clark@example.com',
      password: passwordHash,
      role: Role.MEMBER,
    },
  });

  const member4 = await prisma.user.upsert({
    where: { email: 'michael.brown@example.com' },
    update: {},
    create: {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      password: passwordHash,
      role: Role.MEMBER,
    },
  });

  const member5 = await prisma.user.upsert({
    where: { email: 'lisa.ray@example.com' },
    update: {},
    create: {
      name: 'Lisa Ray',
      email: 'lisa.ray@example.com',
      password: passwordHash,
      role: Role.MEMBER,
    },
  });

  // eslint-disable-next-line no-console
  console.log('✅ Users seeded: 1 Admin, 2 Managers, 5 Members');

  // 2. Seed Boards
  const board1 = await prisma.board.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Main Development Board',
      theme: 'light',
    },
  });

  const board2 = await prisma.board.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Sprint 24 Kanban',
      theme: 'dark',
    },
  });

  // eslint-disable-next-line no-console
  console.log('✅ Boards seeded');

  // 3. Seed Categories
  const categoryNames = [
    'Frontend',
    'Backend',
    'Database',
    'DevOps',
    'Design',
    'Testing',
    'Documentation',
  ];

  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = cat.id;
  }

  // eslint-disable-next-line no-console
  console.log('✅ Categories seeded');

  // 4. Seed Tags
  const tagDefs = [
    { name: 'Dashlite', theme: 'info' },
    { name: 'HTML', theme: 'danger' },
    { name: 'React', theme: 'primary' },
    { name: 'Node', theme: 'success' },
    { name: 'PostgreSQL', theme: 'warning' },
    { name: 'API', theme: 'secondary' },
    { name: 'Bug', theme: 'danger' },
    { name: 'Feature', theme: 'success' },
  ];

  const tags: Record<string, string> = {};
  for (const tagDef of tagDefs) {
    const tag = await prisma.tag.upsert({
      where: { name: tagDef.name },
      update: { theme: tagDef.theme },
      create: tagDef,
    });
    tags[tagDef.name] = tag.id;
  }

  // eslint-disable-next-line no-console
  console.log('✅ Tags seeded');

  // 5. Seed Tasks
  const taskData = [
    {
      title: 'Implement Design into template',
      description: 'Start implementing new dashboard design and components @dashlite',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      boardId: board1.id,
      categoryId: categories['Frontend'],
      createdById: manager1.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      assigneeIds: [member1.id, member2.id],
      tagIds: [tags['Dashlite'], tags['React'], tags['Feature']],
      comments: [
        { userId: member1.id, comment: 'Design implementation has been started.' },
        { userId: manager1.id, comment: 'Looking great, please ensure mobile responsiveness.' },
      ],
    },
    {
      title: 'PostgreSQL Migration and Index Tuning',
      description: 'Setup production schema, create foreign keys, composite indexes, and optimize query plans.',
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      boardId: board1.id,
      categoryId: categories['Database'],
      createdById: adminUser.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assigneeIds: [member3.id],
      tagIds: [tags['PostgreSQL'], tags['API']],
      comments: [
        { userId: adminUser.id, comment: 'Priority task for backend performance.' },
      ],
    },
    {
      title: 'Socket.IO Real-time Board Synchronization',
      description: 'Implement WebSocket rooms and broadcast task movement, assignees, and comment events.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      boardId: board1.id,
      categoryId: categories['Backend'],
      createdById: manager2.id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      assigneeIds: [member4.id, member5.id],
      tagIds: [tags['Node'], tags['API']],
      comments: [
        { userId: member4.id, comment: 'Socket rooms setup completed. Writing integration tests.' },
      ],
    },
    {
      title: 'Fix Authentication Token Expiry Bug',
      description: 'Resolve token refresh mismatch issue when user session exceeds JWT duration.',
      status: TaskStatus.REVIEW,
      priority: TaskPriority.MEDIUM,
      boardId: board1.id,
      categoryId: categories['Backend'],
      createdById: manager1.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      assigneeIds: [member2.id],
      tagIds: [tags['Bug'], tags['Node']],
      comments: [
        { userId: member2.id, comment: 'PR submitted for review.' },
      ],
    },
    {
      title: 'Write OpenAPI Swagger Specification',
      description: 'Document all REST APIs with schemas, status codes, query parameters, and auth headers.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      boardId: board1.id,
      categoryId: categories['Documentation'],
      createdById: manager2.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      assigneeIds: [member3.id],
      tagIds: [tags['API'], tags['Feature']],
      comments: [
        { userId: member3.id, comment: 'Swagger UI is accessible at /api-docs.' },
      ],
    },
    {
      title: 'Third-party Webhook Integration',
      description: 'Blocked waiting on API credentials and sandbox access from external payment vendor.',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.LOW,
      boardId: board2.id,
      categoryId: categories['DevOps'],
      createdById: adminUser.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assigneeIds: [member5.id],
      tagIds: [tags['API']],
      comments: [
        { userId: member5.id, comment: 'Contacted vendor support on Monday. Awaiting response.' },
      ],
    },
  ];

  for (const t of taskData) {
    const existingTask = await prisma.task.findFirst({
      where: { title: t.title, boardId: t.boardId },
    });

    if (!existingTask) {
      const createdTask = await prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          boardId: t.boardId,
          categoryId: t.categoryId,
          createdById: t.createdById,
          dueDate: t.dueDate,
          assignees: {
            create: t.assigneeIds.map((userId) => ({ userId })),
          },
          tags: {
            create: t.tagIds.map((tagId) => ({ tagId })),
          },
          comments: {
            create: t.comments.map((c) => ({
              userId: c.userId,
              comment: c.comment,
            })),
          },
        },
      });
      // eslint-disable-next-line no-console
      console.log(`Created task: ${createdTask.title}`);
    }
  }

  // eslint-disable-next-line no-console
  console.log('✅ Tasks seeded with assignees, tags, and comments');
  // eslint-disable-next-line no-console
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
