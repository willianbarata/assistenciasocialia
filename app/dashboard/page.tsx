import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"
import { getDashboardStats } from "@/lib/finance-actions"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Social</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)}
                        </div>
                        <p className="text-xs text-muted-foreground">Disponível em caixa</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entradas (Mês)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyEntries)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saídas (Mês)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyExits)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${stats.lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">produtos com estoque baixo</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Acesso Rápido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/financeiro/entrada" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 transition-colors">
                                <div className="font-bold text-green-700 dark:text-green-400">Nova Entrada</div>
                                <div className="text-sm text-green-600 dark:text-green-500">Registrar doação ou oferta</div>
                            </Link>
                            <Link href="/dashboard/financeiro/saida" className="block p-4 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
                                <div className="font-bold text-red-700 dark:text-red-400">Nova Despesa</div>
                                <div className="text-sm text-red-600 dark:text-red-500">Registrar saída do caixa</div>
                            </Link>
                            <Link href="/dashboard/estoque/movimentacao" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-colors">
                                <div className="font-bold text-blue-700 dark:text-blue-400">Movimentar Estoque</div>
                                <div className="text-sm text-blue-600 dark:text-blue-500">Entrada ou saída de produtos</div>
                            </Link>
                            <Link href="/dashboard/financeiro/compra-alimentos" className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 transition-colors">
                                <div className="font-bold text-orange-700 dark:text-orange-400">Compra de Alimentos</div>
                                <div className="text-sm text-orange-600 dark:text-orange-500">Registrar Compra + Estoque</div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Alertas de Vencimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.expiringCount > 0 ? (
                                <p className="text-red-600 font-medium">{stats.expiringCount} lotes vencendo nos próximos 30 dias!</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhum produto próximo do vencimento (30 dias).</p>
                            )}
                            <Link href="/dashboard/estoque" className="text-sm text-primary hover:underline">
                                Ver Estoque Completo &rarr;
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
