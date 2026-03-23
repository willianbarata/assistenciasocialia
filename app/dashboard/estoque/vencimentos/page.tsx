import { getExpiringProducts } from "@/lib/stock-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isBefore, isAfter, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function VencimentosPage() {
    const expiringItems = await getExpiringProducts()
    const today = new Date()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Controle de Validade</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lotes por Data de Vencimento</CardTitle>
                    <CardDescription>Lista ordenada dos produtos com vencimento próximo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle">Produto</th>
                                    <th className="h-12 px-4 align-middle">Lote / Origem</th>
                                    <th className="h-12 px-4 align-middle">Qtd Entrada</th>
                                    <th className="h-12 px-4 align-middle">Vencimento</th>
                                    <th className="h-12 px-4 align-middle text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expiringItems.map((item) => {
                                    const expiry = new Date(item.expirationDate!)
                                    const isExpired = isBefore(expiry, today)
                                    const isClose = isAfter(expiry, today) && isBefore(expiry, addDays(today, 30))

                                    return (
                                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{item.product.name}</td>
                                            <td className="p-4 align-middle text-muted-foreground">{item.batch || item.reason || '-'}</td>
                                            <td className="p-4 align-middle">{item.quantity} {item.product.unit}</td>
                                            <td className="p-4 align-middle font-medium">
                                                {format(expiry, "dd/MM/yyyy")}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {isExpired ? (
                                                    <Badge variant="destructive">Vencido</Badge>
                                                ) : isClose ? (
                                                    <Badge className="bg-orange-500 hover:bg-orange-600">Vence em breve</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-600">No Prazo</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {expiringItems.length === 0 && (
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td colSpan={5} className="p-4 align-middle text-center text-muted-foreground">
                                            Nenhum registro com data de validade encontrado.
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
