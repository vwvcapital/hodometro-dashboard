"use client";

import { useState, useCallback, useRef } from "react";
import { useVehicles } from "@/hooks/use-vehicles";
import { bulkUpdateOdometers } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import * as XLSX from "xlsx";

interface ParsedVehicle {
  placa: string;
  hodometroFinal: number;
}

interface ImportResult {
  updated: number;
  notFound: string[];
  errors: string[];
}

function ImportContent() {
  const { vehicles, loading: vehiclesLoading, refresh } = useVehicles();
  const [parsedData, setParsedData] = useState<ParsedVehicle[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setParseError(null);
    setResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays (raw rows)
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        if (rows.length < 2) {
          setParseError("O arquivo não contém dados suficientes.");
          return;
        }

        // Column B (index 1) = Vehicle plate
        // Column E (index 4) = Hodômetro Final (Km)
        const vehicleMap = new Map<string, number>();

        // Skip header row (index 0), process data rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          // Remove sufixo após hífen (ex: "RCD8C19-2" → "RCD8C19")
          const rawPlaca = String(row[1] ?? "").trim().toUpperCase().replace(/-\d+$/, "");
          const rawHodometro = row[4];

          if (!rawPlaca || rawPlaca === "") continue;

          // Parse the odometer value (handle comma as decimal separator)
          let hodometro: number;
          if (typeof rawHodometro === "number") {
            hodometro = rawHodometro;
          } else {
            const cleaned = String(rawHodometro ?? "")
              .replace(/\./g, "")
              .replace(",", ".")
              .trim();
            hodometro = parseFloat(cleaned);
          }

          if (isNaN(hodometro) || hodometro <= 0) continue;

          // Keep the maximum odometer for each vehicle
          const current = vehicleMap.get(rawPlaca) || 0;
          if (hodometro > current) {
            vehicleMap.set(rawPlaca, hodometro);
          }
        }

        if (vehicleMap.size === 0) {
          setParseError(
            "Nenhum veículo válido encontrado. Verifique se a Coluna B contém a placa e a Coluna E contém o hodômetro final."
          );
          return;
        }

        const parsed: ParsedVehicle[] = Array.from(vehicleMap.entries())
          .map(([placa, hodometroFinal]) => ({
            placa,
            hodometroFinal: Math.round(hodometroFinal),
          }))
          .sort((a, b) => a.placa.localeCompare(b.placa));

        setParsedData(parsed);
      } catch (err) {
        console.error("Error parsing file:", err);
        setParseError(
          "Erro ao processar o arquivo. Verifique se é um arquivo XLS/XLSX/CSV válido."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setParsedData([]);
    setFileName(null);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    setResult(null);

    try {
      const updates = parsedData.map((v) => ({
        placa: v.placa,
        hodometroKm: v.hodometroFinal,
      }));

      const res = await bulkUpdateOdometers(updates);
      setResult({
        updated: res.updated,
        notFound: res.notFound,
        errors: res.errors,
      });

      // Refresh vehicle data after successful update
      if (res.updated > 0) {
        await refresh();
      }
    } catch (err) {
      setResult({
        updated: 0,
        notFound: [],
        errors: ["Erro inesperado ao atualizar os hodômetros."],
      });
    } finally {
      setUploading(false);
    }
  };

  // Find which parsed vehicles exist in our system
  const existingPlacas = new Set(vehicles.map((v) => v.PLACA.toUpperCase()));

  const matchedVehicles = parsedData.filter((p) =>
    existingPlacas.has(p.placa.toUpperCase())
  );
  const unmatchedVehicles = parsedData.filter(
    (p) => !existingPlacas.has(p.placa.toUpperCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar vehicleCount={vehicles.length} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Importar Hodômetros
            </h1>
            <p className="text-sm text-gray-500 sm:text-base">
              Carregue um arquivo XLS/XLSX/CSV para atualizar os hodômetros em
              lote
            </p>
          </div>

          {/* Upload Area */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5" />
                Carregar Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!fileName ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
                >
                  <FileSpreadsheet className="mb-3 h-12 w-12 text-gray-400" />
                  <p className="mb-1 text-sm font-medium text-gray-700">
                    Arraste e solte seu arquivo aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    ou clique para selecionar (XLS, XLSX, CSV)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {parsedData.length} veículo(s) encontrado(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {parseError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{parseError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <strong>Formato esperado:</strong> A <strong>Coluna B</strong> deve
              conter a placa do veículo e a <strong>Coluna E</strong> deve conter
              o Hodômetro Final (Km). Quando houver múltiplos registros do mesmo
              veículo, será utilizado automaticamente o{" "}
              <strong>maior valor de hodômetro</strong>.
            </p>
          </div>

          {/* Preview Data */}
          {parsedData.length > 0 && !result && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Pré-visualização dos Dados
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {unmatchedVehicles.length > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {unmatchedVehicles.length} não encontrado(s)
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {matchedVehicles.length} para atualizar
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Placa
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Hodômetro Atual
                        </th>
                        <th className="px-4 py-2 text-center font-medium text-gray-600">
                          
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Novo Hodômetro
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedData.map((item) => {
                        const existing = vehicles.find(
                          (v) =>
                            v.PLACA.toUpperCase() === item.placa.toUpperCase()
                        );
                        const isMatch = !!existing;
                        const currentKm = existing?.HODOMETRO ?? 0;
                        const diff = item.hodometroFinal - currentKm;

                        return (
                          <tr
                            key={item.placa}
                            className={
                              isMatch
                                ? "bg-white"
                                : "bg-amber-50/50"
                            }
                          >
                            <td className="px-4 py-2 font-mono font-medium text-gray-900">
                              {item.placa}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {isMatch
                                ? `${currentKm.toLocaleString("pt-BR")} km`
                                : "—"}
                            </td>
                            <td className="px-4 py-2 text-center text-gray-400">
                              {isMatch && <ArrowRight className="inline h-4 w-4" />}
                            </td>
                            <td className="px-4 py-2 font-medium text-gray-900">
                              {item.hodometroFinal.toLocaleString("pt-BR")} km
                            </td>
                            <td className="px-4 py-2">
                              {isMatch ? (
                                diff > 0 ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    +{diff.toLocaleString("pt-BR")} km
                                  </Badge>
                                ) : diff === 0 ? (
                                  <Badge variant="outline" className="text-gray-500">
                                    Sem alteração
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                    {diff.toLocaleString("pt-BR")} km
                                  </Badge>
                                )
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Não cadastrado
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Somente os veículos cadastrados no sistema serão atualizados.
                    {unmatchedVehicles.length > 0 &&
                      ` ${unmatchedVehicles.length} veículo(s) não encontrado(s) serão ignorados.`}
                  </p>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || matchedVehicles.length === 0}
                    className="gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Atualizar {matchedVehicles.length} Hodômetro(s)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.errors.length === 0 && result.updated > 0 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Importação Concluída
                    </>
                  ) : result.updated > 0 ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Importação Parcial
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      Falha na Importação
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.updated > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <p className="text-sm text-green-700">
                      <strong>{result.updated}</strong> hodômetro(s)
                      atualizado(s) com sucesso.
                    </p>
                  </div>
                )}

                {result.notFound.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-700">
                        <strong>{result.notFound.length}</strong> veículo(s) não
                        encontrado(s) no sistema:
                      </p>
                      <p className="mt-1 text-xs font-mono text-amber-600">
                        {result.notFound.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm text-red-700">
                        Erros durante a atualização:
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-red-600">
                        {result.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" onClick={clearFile} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar Novo Arquivo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ImportarPage() {
  return (
    <AuthGuard>
      <ImportContent />
    </AuthGuard>
  );
}
