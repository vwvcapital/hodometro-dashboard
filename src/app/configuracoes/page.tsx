import { Header } from "@/components/header";
import { RevisionConfigList } from "@/components/revision-config-list";
import { fetchRevisionConfigs } from "@/lib/sheets";

export default async function ConfiguracoesPage() {
  const configs = await fetchRevisionConfigs();

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Configurações"
        description="Gerencie os ciclos de revisão por marca de veículo"
      />

      <main className="p-6">
        <RevisionConfigList configs={configs} />
      </main>
    </div>
  );
}
