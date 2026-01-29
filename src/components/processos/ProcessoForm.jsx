import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProcessoForm({ processo, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titulo_processo: processo?.titulo_processo || "",
    numero_processo: processo?.numero_processo || "",
    vara_comarca: processo?.vara_comarca || "",
    link_pasta: processo?.link_pasta || "",
    valor_causa: processo?.valor_causa || "",
    parte_autora: processo?.parte_autora || "",
    parte_re: processo?.parte_re || "",
    valor_total_honorarios: processo?.valor_total_honorarios || "",
    divisao_advogado1: processo?.divisao_advogado1 || 0,
    divisao_advogado2: processo?.divisao_advogado2 || 0,
    divisao_advogado3: processo?.divisao_advogado3 || 0,
    status_processo: processo?.status_processo || "ativo"
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro quando o campo for preenchido
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titulo_processo.trim()) {
      newErrors.titulo_processo = "Título do processo é obrigatório";
    }
    
    if (!formData.numero_processo.trim()) {
      newErrors.numero_processo = "Número do processo é obrigatório";
    }

    // Validar divisão de honorários se valor for informado
    if (formData.valor_total_honorarios > 0) {
      const totalDivisao = Number(formData.divisao_advogado1) + 
                          Number(formData.divisao_advogado2) + 
                          Number(formData.divisao_advogado3);
      
      if (totalDivisao !== 100) {
        newErrors.divisao = "A soma das porcentagens deve ser exatamente 100%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        valor_causa: formData.valor_causa ? Number(formData.valor_causa) : 0,
        valor_total_honorarios: formData.valor_total_honorarios ? Number(formData.valor_total_honorarios) : 0,
        divisao_advogado1: Number(formData.divisao_advogado1),
        divisao_advogado2: Number(formData.divisao_advogado2),
        divisao_advogado3: Number(formData.divisao_advogado3)
      };
      onSave(processedData);
    }
  };

  const getTotalDivisao = () => {
    return Number(formData.divisao_advogado1) + 
           Number(formData.divisao_advogado2) + 
           Number(formData.divisao_advogado3);
  };

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-2xl font-bold text-slate-900">
          {processo ? "Editar Processo" : "Novo Processo"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Dados do Processo</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo_processo">Título do Processo *</Label>
                <Input
                  id="titulo_processo"
                  value={formData.titulo_processo}
                  onChange={(e) => handleInputChange("titulo_processo", e.target.value)}
                  placeholder="Ex: João da Silva vs. Empresa XYZ"
                  className={errors.titulo_processo ? "border-red-500" : ""}
                />
                {errors.titulo_processo && (
                  <p className="text-sm text-red-600">{errors.titulo_processo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_processo">Número do Processo *</Label>
                <Input
                  id="numero_processo"
                  value={formData.numero_processo}
                  onChange={(e) => handleInputChange("numero_processo", e.target.value)}
                  placeholder="Ex: 0000000-00.0000.0.00.0000"
                  className={errors.numero_processo ? "border-red-500" : ""}
                />
                {errors.numero_processo && (
                  <p className="text-sm text-red-600">{errors.numero_processo}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vara_comarca">Vara/Comarca</Label>
                <Input
                  id="vara_comarca"
                  value={formData.vara_comarca}
                  onChange={(e) => handleInputChange("vara_comarca", e.target.value)}
                  placeholder="Ex: 1ª Vara Cível"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_processo">Status</Label>
                <Select value={formData.status_processo} onValueChange={(value) => handleInputChange("status_processo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_pasta">Link da Pasta (Nuvem)</Label>
              <Input
                id="link_pasta"
                value={formData.link_pasta}
                onChange={(e) => handleInputChange("link_pasta", e.target.value)}
                placeholder="https://drive.google.com/..."
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_causa">Valor da Causa (R$)</Label>
              <Input
                id="valor_causa"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_causa}
                onChange={(e) => handleInputChange("valor_causa", e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Partes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Partes Envolvidas</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parte_autora">Parte Autora</Label>
                <Input
                  id="parte_autora"
                  value={formData.parte_autora}
                  onChange={(e) => handleInputChange("parte_autora", e.target.value)}
                  placeholder="Nome da parte autora"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parte_re">Parte Ré</Label>
                <Input
                  id="parte_re"
                  value={formData.parte_re}
                  onChange={(e) => handleInputChange("parte_re", e.target.value)}
                  placeholder="Nome da parte ré"
                />
              </div>
            </div>
          </div>

          {/* Honorários */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Honorários e Divisão</h3>
            
            <div className="space-y-2">
              <Label htmlFor="valor_total_honorarios">Valor Total dos Honorários (R$)</Label>
              <Input
                id="valor_total_honorarios"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_total_honorarios}
                onChange={(e) => handleInputChange("valor_total_honorarios", e.target.value)}
                placeholder="0,00"
              />
            </div>

            {formData.valor_total_honorarios > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <h4 className="font-medium text-slate-900">Divisão por Advogado (%)</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="divisao_advogado1">Advogado 1</Label>
                    <Input
                      id="divisao_advogado1"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.divisao_advogado1}
                      onChange={(e) => handleInputChange("divisao_advogado1", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="divisao_advogado2">Advogado 2</Label>
                    <Input
                      id="divisao_advogado2"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.divisao_advogado2}
                      onChange={(e) => handleInputChange("divisao_advogado2", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="divisao_advogado3">Advogado 3</Label>
                    <Input
                      id="divisao_advogado3"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.divisao_advogado3}
                      onChange={(e) => handleInputChange("divisao_advogado3", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="font-medium text-slate-900">Total da Divisão:</span>
                  <span className={`font-bold ${getTotalDivisao() === 100 ? "text-green-600" : "text-red-600"}`}>
                    {getTotalDivisao()}%
                  </span>
                </div>

                {errors.divisao && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.divisao}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Processo
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}