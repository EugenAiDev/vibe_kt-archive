import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

type CategoryNode = {
  name: string
  children?: CategoryNode[]
}

const baseTree: CategoryNode[] = [
  {
    name: "Голова",
    children: [
      { name: "Головной мозг" },
      { name: "Кости черепа" },
      { name: "ППН (пазухи носа)" },
    ],
  },
  { name: "Шея" },
  {
    name: "ОГК",
    children: [
      { name: "Лёгкие" },
      { name: "Средостение" },
      { name: "Грудная клетка" },
    ],
  },
  {
    name: "Пояс верхних конечностей",
    children: [
      { name: "Плечо" },
      { name: "Ключица" },
      { name: "Локоть" },
      { name: "Предплечье" },
      { name: "Кисть" },
    ],
  },
  { name: "Органы брюшной полости" },
  { name: "Органы малого таза" },
  {
    name: "Пояс нижних конечностей",
    children: [
      { name: "ТБС (тазобедренные суставы)" },
      { name: "Бедро" },
      { name: "Колено" },
      { name: "Голень" },
      { name: "Стопа" },
    ],
  },
  { name: "Кости таза" },
  {
    name: "Позвоночник",
    children: [
      { name: "Шейный отдел" },
      { name: "Грудной отдел" },
      { name: "Пояснично-крестцовый отдел" },
      { name: "Копчик" },
    ],
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

async function createTree(params: {
  section: "CT" | "XRAY"
  parentId?: string | null
  nodes: CategoryNode[]
}) {
  const { section, parentId = null, nodes } = params

  for (const node of nodes) {
    const created = await prisma.category.create({
      data: {
        name: node.name,
        slug: slugify(node.name),
        parentId,
        section,
        isLocked: true,
      },
    })

    if (node.children?.length) {
      await createTree({ section, parentId: created.id, nodes: node.children })
    }
  }
}

async function main() {
  const name = process.env.ADMIN_NAME ?? "Главный администратор"
  const email = process.env.ADMIN_EMAIL ?? "admin@kt-archive.local"
  const password = process.env.ADMIN_PASSWORD ?? "StrongPassword123!"
  const hash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email,
      name,
      password: hash,
      role: "ADMIN",
      isActive: true,
    },
  })

  const categoryCount = await prisma.category.count()
  if (categoryCount === 0) {
    await prisma.category.create({
      data: {
        name: "КТ",
        slug: "ct",
        section: "CT",
        isLocked: true,
      },
    })
    await prisma.category.create({
      data: {
        name: "Рентген",
        slug: "xray",
        section: "XRAY",
        isLocked: true,
      },
    })

    const ctRoot = await prisma.category.findFirst({
      where: { name: "КТ", section: "CT" },
    })
    const xrayRoot = await prisma.category.findFirst({
      where: { name: "Рентген", section: "XRAY" },
    })

    if (ctRoot) await createTree({ section: "CT", parentId: ctRoot.id, nodes: baseTree })
    if (xrayRoot) await createTree({ section: "XRAY", parentId: xrayRoot.id, nodes: baseTree })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
