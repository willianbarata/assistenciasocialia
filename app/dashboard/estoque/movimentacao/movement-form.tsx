'use client'

import { createStockMovement } from "@/lib/stock-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Processando...' : 'Confirmar Movimentação'}
        </Button>
    )
}

type Product = {
    id: string
    name: string
    unit: string
}

export function MovementForm({ products }: { products: Product[] }) {
    const [type, setType] = useState('IN')
    const router = useRouter()

    return (
        <form action={async (formData) => {
            await createStockMovement(formData)
            router.push('/dashboard/estoque')
        }} className="space-y-6">

            <div className="space-y-2">
                <Label>Tipo de Movimentação</Label>
                <RadioGroup defaultValue="IN" name="type" onValueChange={setType} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="IN" id="r1" />
                        <Label htmlFor="r1" className="cursor-pointer font-medium text-green-600">Entrada (Add)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OUT" id="r2" />
                        <Label htmlFor="r2" className="cursor-pointer font-medium text-red-600">Saída (Remover)</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="productId">Produto</Label>
                    <Select name="productId" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.unit})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input name="quantity" type="number" min="1" required />
                </div>
            </div>

            {type === 'IN' && (
                <div className="space-y-2">
                    <Label htmlFor="expirationDate">Data de Validade</Label>
                    <Input name="expirationDate" type="date" />
                    <p className="text-xs text-muted-foreground">Essencial para controle de vencimento.</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="reason">Motivo / Origem / Destino</Label>
                <Textarea
                    name="reason"
                    placeholder={type === 'IN' ? "Ex: Doação do Sr. João / Compra no Atacadão" : "Ex: Cesta básica Família Silva / Consumo Interno"}
                />
            </div>

            <div className="pt-2">
                <SubmitButton />
            </div>
        </form>
    )
}
