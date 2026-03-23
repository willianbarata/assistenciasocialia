import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MinusCircle } from "lucide-react"
import Link from 'next/link'
import { getFinancialSummary } from "@/lib/finance-actions"
import { PrismaClient } from "@prisma/client"

// Note: Usually we pass data via props or fetch in component
// Here we are fetching in RSC
const prisma = new PrismaClient()

async function getRecentTransactions() {
    const entries = await prisma.financialEntry.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { responsible: true }
    })
    const exits = await prisma.financialExit.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { responsible: true }
    })


    // Combine and sort
    const combined = [
        ...entries.map(e => ({
            id: e.id,
            date: e.date,
            amount: Number(e.amount),
            paymentMethod: e.paymentMethod,
            description: e.description,
            isEntry: true,
            label: 'Entrada: ' + e.type
        })),
        ...exits.map(e => ({
            id: e.id,
            date: e.date,
            amount: Number(e.amount),
            paymentMethod: e.paymentMethod,
            description: e.description,
            isEntry: false,
            label: 'Saída: ' + e.category
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    return combined
}

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage() {
    const summary = await getFinancialSummary()
    const transactions = await getRecentTransactions()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Financeiro Social</h1>
                <div className="flex gap-2">
                    <Link href="/dashboard/financeiro/entrada">
                        <Button className="gap-2 bg-green-600 hover:bg-green-700">
                            <PlusCircle className="w-4 h-4" />
                            Nova Entrada
                        </Button>
                    </Link>
                    <Link href="/dashboard/financeiro/saida">
                        <Button variant="destructive" className="gap-2">
                            <MinusCircle className="w-4 h-4" />
                            Nova Saída
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.balance)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Entradas (Total)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.entries)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Saídas (Total)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.exits)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Últimas Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium">
                                        {t.label}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(t.date).toLocaleDateString('pt-BR')} • {t.paymentMethod}
                                        {t.description && ` • ${t.description}`}
                                    </div>
                                </div>
                                <div className={`font-bold ${t.isEntry ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.isEntry ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center text-muted-foreground py-4">
                                Nenhuma movimentação registrada.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
