import { createStockMovement, getProducts } from "@/lib/stock-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// This is a server component that fetches products
export const dynamic = 'force-dynamic'

export default async function MovimentacaoPage() {
    const products = await getProducts()

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Movimentação de Estoque</CardTitle>
                    <CardDescription>Registre entradas (compras/doações) ou saídas (distribuição).</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 
                We use a client-side wrapper or standard form with server action. 
                For improved UX (dynamic fields based on IN/OUT), we might need a client component.
                But for MVP, we can show all relevant fields or use Client Component for internal logic.
                Let's make this page render a Client Component that handles the interaction logic, 
                passing products as props.
            */}
                    <MovementForm products={products} />
                </CardContent>
            </Card>
        </div>
    )
}

import { MovementForm } from "./movement-form"
