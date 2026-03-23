'use server'

import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

const EntrySchema = z.object({
    amount: z.coerce.number().positive("O valor deve ser positivo"),
    type: z.string().min(1, "Selecione o tipo"),
    paymentMethod: z.string().min(1, "Selecione a forma de pagamento"),
    date: z.string().nullable().optional(), // ISO string or undefined
    description: z.string().nullable().optional(),
})

const ExitSchema = z.object({
    amount: z.coerce.number().positive("O valor deve ser positivo"),
    category: z.string().min(1, "Selecione a categoria"),
    paymentMethod: z.string().min(1, "Selecione a forma de pagamento"),
    date: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    proofUrl: z.string().nullable().optional(),
})

const PurchaseSchema = z.object({
    amount: z.coerce.number().positive(),
    paymentMethod: z.string().min(1),
    date: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    items: z.string() // JSON string of items
})

const ItemSchema = z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().positive(),
    expirationDate: z.string().optional(),
    unitPrice: z.coerce.number().optional()
}))

export async function createFinancialEntry(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const rawData = {
        amount: formData.get('amount'),
        type: formData.get('type'),
        paymentMethod: formData.get('paymentMethod'),
        date: formData.get('date'),
        description: formData.get('description'),
    }

    const validated = EntrySchema.parse(rawData)

    await prisma.financialEntry.create({
        data: {
            amount: validated.amount,
            type: validated.type,
            paymentMethod: validated.paymentMethod,
            date: validated.date ? new Date(validated.date) : new Date(),
            description: validated.description,
            responsibleId: session.user.id,
        }
    })

    revalidatePath('/dashboard/financeiro')
    revalidatePath('/dashboard')
}

export async function createFinancialExit(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const rawData = {
        amount: formData.get('amount'),
        category: formData.get('category'),
        paymentMethod: formData.get('paymentMethod'),
        date: formData.get('date'),
        description: formData.get('description'),
        proofUrl: formData.get('proofUrl'),
    }

    const validated = ExitSchema.parse(rawData)

    await prisma.financialExit.create({
        data: {
            amount: validated.amount,
            category: validated.category,
            paymentMethod: validated.paymentMethod,
            date: validated.date ? new Date(validated.date) : new Date(),
            description: validated.description,
            proofUrl: validated.proofUrl,
            responsibleId: session.user.id,
        }
    })

    revalidatePath('/dashboard/financeiro')
    revalidatePath('/dashboard')
}

export async function registerFoodPurchase(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const rawData = {
        amount: formData.get('amount'),
        paymentMethod: formData.get('paymentMethod'),
        date: formData.get('date'),
        description: formData.get('description'),
        items: formData.get('items'),
    }

    const validated = PurchaseSchema.parse(rawData)
    const items = ItemSchema.parse(JSON.parse(validated.items))

    await prisma.$transaction(async (tx) => {
        // 1. Create Financial Exit
        const exit = await tx.financialExit.create({
            data: {
                amount: validated.amount,
                category: 'Alimentos', // Fixed category
                paymentMethod: validated.paymentMethod,
                date: validated.date ? new Date(validated.date) : new Date(),
                description: validated.description,
                responsibleId: session.user.id
            }
        })

        // 2. Create Stock Movements
        for (const item of items) {
            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    type: 'IN',
                    quantity: item.quantity,
                    date: validated.date ? new Date(validated.date) : new Date(),
                    expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
                    reason: 'Compra - ' + (validated.description || ''),
                    financialExitId: exit.id,
                    responsibleId: session.user.id
                }
            })

            await tx.product.update({
                where: { id: item.productId },
                data: { currentStock: { increment: item.quantity } }
            })
        }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/financeiro')
    revalidatePath('/dashboard/estoque')
}

export async function getFinancialSummary() {
    const entries = await prisma.financialEntry.aggregate({
        _sum: { amount: true }
    })
    const exits = await prisma.financialExit.aggregate({
        _sum: { amount: true }
    })

    return {
        entries: entries._sum.amount?.toNumber() || 0,
        exits: exits._sum.amount?.toNumber() || 0,
        balance: (entries._sum.amount?.toNumber() || 0) - (exits._sum.amount?.toNumber() || 0)
    }
}

export async function getDashboardStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Balance
    const entriesSum = await prisma.financialEntry.aggregate({ _sum: { amount: true } })
    const exitsSum = await prisma.financialExit.aggregate({ _sum: { amount: true } })
    const balance = (entriesSum._sum.amount?.toNumber() || 0) - (exitsSum._sum.amount?.toNumber() || 0)

    // Monthly
    const monthlyEntries = await prisma.financialEntry.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
    })
    const monthlyExits = await prisma.financialExit.aggregate({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
    })

    // Stock Alerts
    const lowStockProducts = await prisma.product.count({
        where: {
            currentStock: { lte: prisma.product.fields.minStock }
        }
    })

    const next30Days = new Date(now)
    next30Days.setDate(now.getDate() + 30)

    const expringMovements = await prisma.stockMovement.count({
        where: {
            type: 'IN',
            expirationDate: {
                gte: now,
                lte: next30Days
            }
        }
    })

    return {
        balance,
        monthlyEntries: monthlyEntries._sum.amount?.toNumber() || 0,
        monthlyExits: monthlyExits._sum.amount?.toNumber() || 0,
        lowStockCount: lowStockProducts,
        expiringCount: expringMovements
    }
}
