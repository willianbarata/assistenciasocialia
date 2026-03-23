'use client'

import { createFinancialEntry } from "@/lib/finance-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full bg-green-600 hover:bg-green-700" type="submit" disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar Entrada'}
        </Button>
    )
}

export const dynamic = 'force-dynamic'

export default function EntryPage() {
    const router = useRouter()

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Nova Entrada Financeira</CardTitle>
                    <CardDescription>Registre doações, ofertas ou repasses para o caixa social.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        await createFinancialEntry(formData)
                        router.push('/dashboard/financeiro')
                    }} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Valor (R$)</Label>
                                <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0,00" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Data</Label>
                                <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Entrada</Label>
                            <Select name="type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Doação">Doação para Ação Social</SelectItem>
                                    <SelectItem value="Oferta">Oferta Social</SelectItem>
                                    <SelectItem value="Campanha">Campanha Social</SelectItem>
                                    <SelectItem value="Repasse">Repasse da Igreja</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Forma de Recebimento</Label>
                            <Select name="paymentMethod" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Observações (Opcional)</Label>
                            <Textarea id="description" name="description" placeholder="Detalhes adicionais..." />
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
