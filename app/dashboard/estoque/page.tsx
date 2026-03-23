import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Archive, AlertTriangle } from "lucide-react"
import Link from 'next/link'
import { getProducts } from "@/lib/stock-actions"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function EstoquePage() {
    const products = await getProducts()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gestão de Alimentos</h1>
                <div className="flex gap-2">
                    <Link href="/dashboard/estoque/movimentacao">
                        <Button variant="outline" className="gap-2">
                            Movimentação (Entrada/Saída)
                        </Button>
                    </Link>
                    <Link href="/dashboard/estoque/vencimentos">
                        <Button variant="outline" className="gap-2 border-orange-200 hover:bg-orange-50 text-orange-700">
                            <AlertTriangle className="w-4 h-4" />
                            Validade
                        </Button>
                    </Link>
                    <Link href="/dashboard/estoque/novo">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Novo Produto
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {products.filter(p => p.currentStock <= p.minStock).length}
                        </div>
                    </CardContent>
                </Card>
                {/* Add Expiry Alert Card later */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventário Atual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle">Produto</th>
                                    <th className="h-12 px-4 align-middle">Categoria</th>
                                    <th className="h-12 px-4 align-middle">Estoque</th>
                                    <th className="h-12 px-4 align-middle">Min.</th>
                                    <th className="h-12 px-4 align-middle">Status</th>
                                    <th className="h-12 px-4 align-middle text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{product.name}</td>
                                        <td className="p-4 align-middle">{product.category}</td>
                                        <td className="p-4 align-middle">
                                            {product.currentStock} {product.unit}
                                        </td>
                                        <td className="p-4 align-middle">{product.minStock}</td>
                                        <td className="p-4 align-middle">
                                            {product.currentStock <= product.minStock ? (
                                                <Badge variant="destructive">Baixo</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Link href={`/dashboard/estoque/${product.id}`} className="text-primary hover:underline">
                                                Detalhes
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td colSpan={6} className="p-4 align-middle text-center text-muted-foreground">
                                            Nenhum produto cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
