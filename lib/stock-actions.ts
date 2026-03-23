'use server'

import { auth } from '@/lib/auth'
import { PrismaClient, MovementType } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

const ProductSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    category: z.string().min(1, "Selecione a categoria"),
    unit: z.string().min(1, "Selecione a unidade"),
    minStock: z.coerce.number().min(0, "Estoque mínimo não pode ser negativo"),
})

const MovementSchema = z.object({
    productId: z.string().cuid(),
    quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
    type: z.nativeEnum(MovementType),
    expirationDate: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    batch: z.string().nullable().optional(),
})

export async function createProduct(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const validated = ProductSchema.parse({
        name: formData.get('name'),
        category: formData.get('category'),
        unit: formData.get('unit'),
        minStock: formData.get('minStock'),
    })

    await prisma.product.create({
        data: {
            ...validated,
        }
    })

    revalidatePath('/dashboard/estoque')
}

export async function createStockMovement(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const validated = MovementSchema.parse({
        productId: formData.get('productId'),
        quantity: formData.get('quantity'),
        type: formData.get('type'),
        expirationDate: formData.get('expirationDate'),
        reason: formData.get('reason'),
        batch: formData.get('batch'),
    })

    // Transaction to ensure stock count is updated safely
    await prisma.$transaction(async (tx) => {
        // Create movement
        await tx.stockMovement.create({
            data: {
                productId: validated.productId,
                quantity: validated.quantity,
                type: validated.type,
                expirationDate: validated.expirationDate ? new Date(validated.expirationDate) : null,
                reason: validated.reason,
                batch: validated.batch,
                responsibleId: session.user.id,
            }
        })

        // Update product stock
        if (validated.type === 'IN') {
            await tx.product.update({
                where: { id: validated.productId },
                data: { currentStock: { increment: validated.quantity } }
            })
        } else {
            await tx.product.update({
                where: { id: validated.productId },
                data: { currentStock: { decrement: validated.quantity } }
            })
        }
    })

    revalidatePath('/dashboard/estoque')
    revalidatePath(`/dashboard/estoque/${validated.productId}`)
}

export async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getProductById(id: string) {
    return await prisma.product.findUnique({
        where: { id },
        include: {
            movements: {
                orderBy: { date: 'desc' },
                take: 5
            }
        }
    })
}

export async function getExpiringProducts() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch IN movements with expiration date, sorted by date ASC
    return await prisma.stockMovement.findMany({
        where: {
            type: 'IN',
            expirationDate: {
                not: null
            }
        },
        orderBy: {
            expirationDate: 'asc'
        },
        include: {
            product: true
        }
    })
}
