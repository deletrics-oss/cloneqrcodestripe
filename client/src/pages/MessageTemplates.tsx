import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Plus, Search, Edit2, Trash2, Wand2, Save, X,
    Check, Copy, FileText, ArrowRight, Upload, Image as ImageIcon, Video, Link as LinkIcon, FileInput
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const [useEmojis, setUseEmojis] = useState(true);
    const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
    const [mediaUrl, setMediaUrl] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Menu extraction states
    const [extractSource, setExtractSource] = useState<"image" | "url" | "text">("image");
    const [extractImageData, setExtractImageData] = useState("");
    const [extractUrl, setExtractUrl] = useState("");
    const [extractText, setExtractText] = useState("");
    const [extractInstruction, setExtractInstruction] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const extractFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExtractFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setExtractImageData(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExtractMenu = async () => {
        setIsExtracting(true);
        try {
            let sourceContent = "";
            if (extractSource === "image") {
                if (!extractImageData) {
                    toast({ title: "Erro", description: "Faça upload de uma imagem primeiro", variant: "destructive" });
                    setIsExtracting(false);
                    return;
                }
                sourceContent = extractImageData;
            } else if (extractSource === "url") {
                if (!extractUrl) {
                    toast({ title: "Erro", description: "Cole o link do cardápio", variant: "destructive" });
                    setIsExtracting(false);
                    return;
                }
                sourceContent = extractUrl;
            } else if (extractSource === "text") {
                if (!extractText) {
                    toast({ title: "Erro", description: "Cole o texto do cardápio", variant: "destructive" });
                    setIsExtracting(false);
                    return;
                }
                sourceContent = extractText;
            }

            // Auto-detect if URL is an image
            let finalSourceType = extractSource;
            if (extractSource === "url" && extractUrl) {
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.heif', '.tiff', '.svg'];
                const urlLower = extractUrl.toLowerCase();
                const isImageUrl = imageExtensions.some(ext => urlLower.includes(ext));
                if (isImageUrl) {
                    finalSourceType = "image";
                }
            }

            const res = await apiRequest("POST", "/api/ai/extract-menu", {
                sourceType: finalSourceType,
                sourceContent,
                instruction: extractInstruction || "Formate como mensagem de WhatsApp com emojis e preços organizados"
            });
            const data = await res.json();

            // Set the extracted text as the AI result
            setAiResult(data.extracted);
            toast({ title: "Sucesso!", description: "Cardápio extraído e formatado" });

            // Clear extraction data
            setExtractImageData("");
            setExtractUrl("");
            setExtractText("");
        } catch (error: any) {
            toast({
                title: "Erro na extração",
                description: error.message || "Não foi possível processar o cardápio",
                variant: "destructive"
            });
        } finally {
            setIsExtracting(false);
        }
    };

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
        if (!originalContent || !aiInstruction) return;

        setIsAiLoading(true);
        try {
            const res = await apiRequest("POST", "/api/ai/edit-template", {
                content: originalContent,
                instruction: aiInstruction,
                useEmojis
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

        let finalContent = aiResult;
        if (mediaUrl) {
            finalContent += `\n\n[MEDIA:${mediaType === "image" ? "IMAGE" : "VIDEO"}:${mediaUrl}]`;
        }

        // Ask if overwrite or create new
        if (confirm("Deseja sobrescrever o template original? Cancelar criará um novo.")) {
            updateMutation.mutate({ id: selectedTemplate.id, content: finalContent });
        } else {
            createMutation.mutate({
                name: `${selectedTemplate.name} (Editado)`,
                content: finalContent,
                category: selectedTemplate.category || undefined
            });
        }
        setIsAiEditOpen(false);
        setAiResult("");
        setAiInstruction("");
        setMediaUrl("");
        setMediaType("none");
    };

    const openAiEditor = (template: MessageTemplate) => {
        setSelectedTemplate(template);
        setOriginalContent(template.content);
        // Extract existing media URL if present
        const mediaMatch = template.content.match(/\[MEDIA:(IMAGE|VIDEO):(.*?)\]/);
        if (mediaMatch) {
            setMediaType(mediaMatch[1].toLowerCase() as "image" | "video");
            setMediaUrl(mediaMatch[2]);
            setOriginalContent(template.content.replace(mediaMatch[0], '').trim());
        } else {
            setMediaUrl("");
            setMediaType("none");
        }
        setAiResult("");
        setIsAiEditOpen(true);
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
                                            onClick={() => openAiEditor(template)}
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
                <DialogContent className="max-w-5xl h-[95vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-purple-500" />
                            Editor Inteligente
                        </DialogTitle>
                        <DialogDescription>
                            Use IA para transformar sua mensagem ou extrair de cardápios
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <Tabs defaultValue="editor" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="editor">✏️ Editor</TabsTrigger>
                                <TabsTrigger value="extract">🍕 Extrair Conteúdo</TabsTrigger>
                            </TabsList>

                            <TabsContent value="editor" className="flex-1 overflow-hidden mt-4">
                                <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2 h-full">
                                        <label className="text-sm font-medium">Original (Editável)</label>
                                        <Textarea
                                            value={originalContent}
                                            onChange={(e) => setOriginalContent(e.target.value)}
                                            className="flex-1 resize-none font-mono text-sm"
                                            placeholder="Conteúdo original..."
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 h-full">
                                        <label className="text-sm font-medium flex justify-between items-center">
                                            Resultado
                                            {aiResult && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Gerado</Badge>}
                                        </label>
                                        {isAiLoading ? (
                                            <div className="flex-1 border rounded-md flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/50">
                                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                <span>Gerando nova versão...</span>
                                            </div>
                                        ) : (
                                            <Textarea
                                                value={aiResult}
                                                onChange={(e) => setAiResult(e.target.value)}
                                                className="flex-1 resize-none font-mono text-sm border-purple-200 bg-purple-50/10 focus-visible:ring-purple-500"
                                                placeholder="O resultado da IA aparecerá aqui..."
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="extract" className="flex-1 overflow-auto mt-4">
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-md bg-blue-50/50 border-blue-200">
                                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                            <FileInput className="w-4 h-4" />
                                            Fonte de Dados do Cardápio
                                        </h4>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Escolha de onde quer extrair: foto, link ou texto
                                        </p>

                                        <Tabs value={extractSource} onValueChange={(v: any) => setExtractSource(v)}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="image">📷 Foto</TabsTrigger>
                                                <TabsTrigger value="url">🔗 Link</TabsTrigger>
                                                <TabsTrigger value="text">📝 Texto</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="image" className="space-y-3 mt-3">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Arquivo selecionado..."
                                                        value={extractImageData ? "✅ Imagem carregada" : ""}
                                                        disabled
                                                        className="flex-1"
                                                    />
                                                    <input
                                                        type="file"
                                                        ref={extractFileInputRef}
                                                        className="hidden"
                                                        accept="image/*,.pdf,.heic,.heif"
                                                        onChange={handleExtractFileUpload}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        type="button"
                                                        onClick={() => extractFileInputRef.current?.click()}
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload
                                                    </Button>
                                                </div>
                                                {extractImageData && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                                                        <img src={extractImageData} alt="Preview" className="max-h-32 rounded border" />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setExtractImageData("")}
                                                            className="text-destructive h-auto p-0 mt-1"
                                                        >
                                                            Remover
                                                        </Button>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="url" className="space-y-3 mt-3">
                                                <Input
                                                    placeholder="Cole o link do cardápio (ex: https://...)"
                                                    value={extractUrl}
                                                    onChange={(e) => setExtractUrl(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Funciona com sites, Google Drive, Dropbox, etc.
                                                </p>
                                            </TabsContent>

                                            <TabsContent value="text" className="space-y-3 mt-3">
                                                <Textarea
                                                    placeholder="Cole o texto do cardápio aqui..."
                                                    value={extractText}
                                                    onChange={(e) => setExtractText(e.target.value)}
                                                    rows={6}
                                                />
                                            </TabsContent>
                                        </Tabs>

                                        <div className="mt-3 space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground">Instrução para IA (opcional)</label>
                                            <Input
                                                placeholder="Ex: Organize por categorias, adicione preços em reais..."
                                                value={extractInstruction}
                                                onChange={(e) => setExtractInstruction(e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>

                                        <Button
                                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                                            onClick={handleExtractMenu}
                                            disabled={isExtracting}
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processando...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="w-4 h-4 mr-2" />
                                                    Extrair e Formatar
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Resultado da Extração</label>
                                        <Textarea
                                            value={aiResult}
                                            onChange={(e) => setAiResult(e.target.value)}
                                            className="h-64 font-mono text-sm"
                                            placeholder="O cardápio extraído e formatado aparecerá aqui..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div >

                    <div className="space-y-4 pt-4 border-t">
                        {/* Media Upload Section */}
                        <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Mídia (Opcional)</label>
                                <Select value={mediaType} onValueChange={(v: any) => setMediaType(v)}>
                                    <SelectTrigger className="w-32 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhuma</SelectItem>
                                        <SelectItem value="image">Imagem</SelectItem>
                                        <SelectItem value="video">Vídeo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {mediaType !== 'none' && (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="URL da mídia (https://...)"
                                            value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                                            onChange={(e) => setMediaUrl(e.target.value)}
                                            disabled={mediaUrl.startsWith('data:')}
                                            className="flex-1"
                                        />
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept={mediaType === 'image' ? "image/*" : "video/*"}
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="shrink-0"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </Button>
                                    </div>

                                    {mediaUrl && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">Preview:</p>
                                            {mediaType === 'image' ? (
                                                <img src={mediaUrl} alt="Preview" className="max-h-32 rounded border" />
                                            ) : (
                                                <video src={mediaUrl} controls className="max-h-32 rounded border" />
                                            )}
                                            {mediaUrl.startsWith('data:') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setMediaUrl("")}
                                                    className="text-destructive h-auto p-0"
                                                >
                                                    Remover arquivo
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="useEmojis"
                                    checked={useEmojis}
                                    onChange={(e) => setUseEmojis(e.target.checked)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="useEmojis" className="text-sm text-muted-foreground cursor-pointer select-none">
                                    Usar Emojis Inteligentes 🤖
                                </label>
                            </div>

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
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsAiEditOpen(false)}>Fechar</Button>
                            <Button onClick={saveAiResult} disabled={!aiResult}>
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Resultado
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent >
            </Dialog >
        </div >
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
