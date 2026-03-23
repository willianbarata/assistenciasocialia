import { getProducts } from "@/lib/stock-actions"
import { PurchaseForm } from "./purchase-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function PurchasePage() {
    const products = await getProducts()

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Compra de Alimentos</CardTitle>
                    <CardDescription>
                        Registre a despesa e entradas no estoque simultaneamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PurchaseForm products={products} />
                </CardContent>
            </Card>
        </div>
    )
}
