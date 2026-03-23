'use client'

import { createFinancialExit } from "@/lib/finance-actions"
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
        <Button className="w-full bg-red-600 hover:bg-red-700" type="submit" disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar Saída'}
        </Button>
    )
}

export const dynamic = 'force-dynamic'

export default function ExitPage() {
    const router = useRouter()

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Nova Saída (Despesa)</CardTitle>
                    <CardDescription>Registre compras de alimentos, auxílios ou gastos operacionais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        await createFinancialExit(formData)
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
                            <Label htmlFor="category">Categoria da Despesa</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alimentos">Compra de Alimentos</SelectItem>
                                    <SelectItem value="Higiene">Material de Higiene</SelectItem>
                                    <SelectItem value="Gás">Gás</SelectItem>
                                    <SelectItem value="Transporte">Transporte</SelectItem>
                                    <SelectItem value="ApoioEmergencial">Apoio Emergencial</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                                    <SelectItem value="Cartão">Cartão de Débito/Crédito</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proofUrl">Comprovante (Imagem/PDF)</Label>
                            {/* Placeholder for now. Needs upload logic later */}
                            <Input id="proofUrl" name="proofUrl" type="text" placeholder="URL do arquivo (Opcional por enquanto)" disabled />
                            <p className="text-xs text-muted-foreground">Upload de arquivos será implementado em breve.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Observações (Detalhes da compra)</Label>
                            <Textarea id="description" name="description" placeholder="Descreva o que foi comprado ou motivo..." />
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
