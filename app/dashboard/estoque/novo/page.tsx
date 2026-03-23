'use client'

import { createProduct } from "@/lib/stock-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Salvando...' : 'Cadastrar Produto'}
        </Button>
    )
}

export const dynamic = 'force-dynamic'

export default function NewProductPage() {
    const router = useRouter()

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Novo Produto</CardTitle>
                    <CardDescription>Cadastre um novo item para controle de estoque.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        await createProduct(formData)
                        router.push('/dashboard/estoque')
                    }} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto</Label>
                            <Input id="name" name="name" placeholder="Ex: Arroz Tipo 1" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select name="category" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cesta Básica">Cesta Básica</SelectItem>
                                        <SelectItem value="Alimentos Perecíveis">Perecíveis</SelectItem>
                                        <SelectItem value="Higiene">Higiene</SelectItem>
                                        <SelectItem value="Limpeza">Limpeza</SelectItem>
                                        <SelectItem value="Outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unidade</Label>
                                <Select name="unit" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">Quilograma (Kg)</SelectItem>
                                        <SelectItem value="un">Unidade (Un)</SelectItem>
                                        <SelectItem value="pct">Pacote (Pct)</SelectItem>
                                        <SelectItem value="lt">Litro (Lt)</SelectItem>
                                        <SelectItem value="cx">Caixa (Cx)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minStock">Estoque Mínimo (Alerta)</Label>
                            <Input id="minStock" name="minStock" type="number" min="0" placeholder="0" required />
                            <p className="text-xs text-muted-foreground">Quantidade mínima para gerar alerta.</p>
                        </div>

                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
