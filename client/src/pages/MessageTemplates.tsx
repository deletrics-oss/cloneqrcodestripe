import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Plus, Search, Edit2, Trash2, Wand2, Save, X,
    Check, Copy, FileText, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    category: string | null;
    createdAt: string;
}

export default function MessageTemplates() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAiEditOpen, setIsAiEditOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
    const { toast } = useToast();

    // Form states
    const [newName, setNewName] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newCategory, setNewCategory] = useState("");

    // AI Edit states
    const [aiInstruction, setAiInstruction] = useState("");
    const [aiResult, setAiResult] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const handleAiGenerate = async () => {
        if (!newName) {
            toast({ title: "Erro", description: "Digite um nome para o template para dar contexto à IA", variant: "destructive" });
            return;
        }
        setIsAiGenerating(true);
        try {
            const res = await apiRequest("POST", "/api/ai/generate-broadcast", {
                prompt: `Crie um modelo de mensagem para WhatsApp sobre: ${newName}. Categoria: ${newCategory}.`,
                context: ""
            });
            const data = await res.json();
            setNewContent(data.message);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao gerar mensagem", variant: "destructive" });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const { data: templates, isLoading } = useQuery<MessageTemplate[]>({
        queryKey: ['/api/templates'],
    });

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; content: string; category?: string }) => {
            return await apiRequest("POST", "/api/templates", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
            setIsCreateOpen(false);
            resetForm();
            toast({ title: "Template criado com sucesso!" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; content: string }) => {
            return await apiRequest("PUT", `/api/templates/${data.id}`, { content: data.content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
            toast({ title: "Template atualizado com sucesso!" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest("DELETE", `/api/templates/${id}`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
            toast({ title: "Template removido!" });
        },
    });

    const handleAiEdit = async () => {
        if (!selectedTemplate || !aiInstruction) return;

        setIsAiLoading(true);
        try {
            const res = await apiRequest("POST", "/api/ai/edit-template", {
                content: selectedTemplate.content,
                instruction: aiInstruction
            });
            const data = await res.json();
            setAiResult(data.edited);
        } catch (error) {
            toast({
                title: "Erro na IA",
                description: "Não foi possível gerar a edição.",
                variant: "destructive"
            });
        } finally {
            setIsAiLoading(false);
        }
    };

    const saveAiResult = () => {
        if (!selectedTemplate || !aiResult) return;

        // Ask if overwrite or create new
        if (confirm("Deseja sobrescrever o template original? Cancelar criará um novo.")) {
            updateMutation.mutate({ id: selectedTemplate.id, content: aiResult });
        } else {
            createMutation.mutate({
                name: `${selectedTemplate.name} (Editado)`,
                content: aiResult,
                category: selectedTemplate.category || undefined
            });
        }
        setIsAiEditOpen(false);
        setAiResult("");
        setAiInstruction("");
    };

    const resetForm = () => {
        setNewName("");
        setNewContent("");
        setNewCategory("");
    };

    const filteredTemplates = templates?.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Templates de Mensagem</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Gerencie e edite suas mensagens com Inteligência Artificial
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Template
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 max-w-md"
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates?.map((template) => (
                        <Card key={template.id} className="flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        {template.category && (
                                            <Badge variant="secondary" className="mt-1">
                                                {template.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedTemplate(template);
                                                setIsAiEditOpen(true);
                                            }}
                                            title="Editar com IA"
                                        >
                                            <Wand2 className="w-4 h-4 text-purple-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMutation.mutate(template.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-4">
                                <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap flex-1 max-h-40 overflow-y-auto">
                                    {template.content}
                                </div>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {new Date(template.createdAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Template</DialogTitle>
                        <DialogDescription>Crie um modelo de mensagem reutilizável</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ex: Lista de Preços"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoria (Opcional)</label>
                            <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Ex: Vendas"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Conteúdo</label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                    onClick={handleAiGenerate}
                                    disabled={isAiGenerating}
                                >
                                    {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                    Gerar com IA
                                </Button>
                            </div>
                            <Textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Digite a mensagem..."
                                className="h-32"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={() => createMutation.mutate({ name: newName, content: newContent, category: newCategory })}>
                            Salvar Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Edit Dialog */}
            <Dialog open={isAiEditOpen} onOpenChange={setIsAiEditOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-purple-500" />
                            Editor Inteligente
                        </DialogTitle>
                        <DialogDescription>
                            Use IA para transformar sua mensagem
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden py-4">
                        <div className="flex flex-col gap-2 h-full">
                            <label className="text-sm font-medium">Original</label>
                            <div className="flex-1 bg-muted p-4 rounded-md whitespace-pre-wrap overflow-y-auto border">
                                {selectedTemplate?.content}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 h-full">
                            <label className="text-sm font-medium flex justify-between">
                                Resultado
                                {aiResult && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Gerado</Badge>}
                            </label>
                            <div className="flex-1 bg-muted p-4 rounded-md whitespace-pre-wrap overflow-y-auto border border-purple-100 bg-purple-50/30">
                                {isAiLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                        <span>Gerando nova versão...</span>
                                    </div>
                                ) : aiResult ? (
                                    aiResult
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                                        O resultado da edição aparecerá aqui
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                value={aiInstruction}
                                onChange={(e) => setAiInstruction(e.target.value)}
                                placeholder="Instrução para a IA (ex: Aumente os preços em 10%, traduza para inglês...)"
                                onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
                            />
                            <Button
                                onClick={handleAiEdit}
                                disabled={!aiInstruction || isAiLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                Gerar
                            </Button>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsAiEditOpen(false)}>Fechar</Button>
                            <Button onClick={saveAiResult} disabled={!aiResult}>
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Resultado
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
