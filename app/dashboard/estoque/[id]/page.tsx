import { getProductById } from "@/lib/stock-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                    <p className="text-muted-foreground">{product.category}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-medium text-muted-foreground">Estoque Atual</div>
                        <div className="text-4xl font-bold">{product.currentStock} <span className="text-lg text-muted-foreground">{product.unit}</span></div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Estoque Mínimo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{product.minStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Situação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {product.currentStock <= product.minStock ? (
                            <span className="flex items-center gap-2 text-red-600 font-bold">
                                Estoque Baixo
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-green-600 font-bold">
                                Normal
                            </span>
                        )}
                    </CardContent>
                </Card>
                {/* Add Expiry Analysis here later */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Movimentação</CardTitle>
                    <CardDescription>Últimas 5 movimentações</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {product.movements.length > 0 ? product.movements.map((move) => (
                            <div key={move.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {move.type === 'IN' ? (
                                            <Badge className="bg-green-600">Entrada</Badge>
                                        ) : (
                                            <Badge variant="destructive">Saída</Badge>
                                        )}
                                        {move.reason || "Sem descrição"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {format(new Date(move.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        {move.expirationDate && (
                                            <span className="text-amber-600 ml-2">
                                                • Vence em: {format(new Date(move.expirationDate), "dd/MM/yyyy")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`font-bold text-lg ${move.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                    {move.type === 'IN' ? '+' : '-'}{move.quantity}
                                </div>
                            </div>
                        )) : (
                            <div className="text-muted-foreground text-center py-4">Nenhuma movimentação registrada.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
