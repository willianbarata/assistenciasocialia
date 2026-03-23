'use client'

import { registerFoodPurchase } from "@/lib/finance-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full bg-orange-600 hover:bg-orange-700" type="submit" disabled={pending}>
            {pending ? 'Processando...' : 'Registrar Compra'}
        </Button>
    )
}

type Product = {
    id: string
    name: string
    unit: string
}

type ItemRow = {
    id: number
    productId: string
    quantity: number
    expirationDate: string
}

export function PurchaseForm({ products }: { products: Product[] }) {
    const router = useRouter()
    const [items, setItems] = useState<ItemRow[]>([{ id: 1, productId: '', quantity: 1, expirationDate: '' }])

    const addItem = () => {
        setItems([...items, { id: Date.now(), productId: '', quantity: 1, expirationDate: '' }])
    }

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id))
        }
    }

    const updateItem = (id: number, field: keyof ItemRow, value: string | number) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
    }

    return (
        <form action={async (formData) => {
            // Append items as JSON
            formData.set('items', JSON.stringify(items))
            await registerFoodPurchase(formData)
            router.push('/dashboard/financeiro')
        }} className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Valor Total da Nota (R$)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0,00" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Data da Compra</Label>
                    <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select name="paymentMethod" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Cartão">Cartão de Débito/Crédito</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Itens Comprados</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                        <Plus className="w-4 h-4" /> Adicionar Item
                    </Button>
                </div>

                <div className="space-y-3 border rounded-md p-4 bg-gray-50 dark:bg-zinc-900">
                    {items.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5 space-y-1">
                                <Label className="text-xs">Produto</Label>
                                <Select
                                    value={item.productId}
                                    onValueChange={(val) => updateItem(item.id, 'productId', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.unit})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">Qtd</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-4 space-y-1">
                                <Label className="text-xs">Validade</Label>
                                <Input
                                    type="date"
                                    value={item.expirationDate}
                                    onChange={(e) => updateItem(item.id, 'expirationDate', e.target.value)}
                                />
                            </div>
                            <div className="col-span-1 pb-1">
                                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Observações / Estabelecimento</Label>
                <Textarea id="description" name="description" placeholder="Ex: Atacadão Assaí - Compra do mês" />
            </div>

            <div className="pt-4">
                <SubmitButton />
            </div>
        </form>
    )
}
