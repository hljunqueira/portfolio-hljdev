import { Helmet } from "react-helmet-async";
import { Map, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsMap } from "@/components/admin/LeadsMap";
import AdminCampaigns from "./AdminCampaigns";

const AdminMaps = () => {
  return (
    <>
      <Helmet><title>HLJ DEV | Mapas & Leads</title></Helmet>
      
      <Tabs defaultValue="map" className="flex flex-col h-[calc(100vh-1px)] overflow-hidden">
        {/* Sub-Header / Tabs Navigation */}
        <div className="px-6 py-4 bg-black border-b border-zinc-900 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" /> Geointeligência <span className="text-primary">HLJ</span>
            </h1>
          </div>
          
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-10 rounded-xl">
            <TabsTrigger 
              value="map" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-zinc-500 font-bold uppercase text-[10px] tracking-widest px-4"
            >
              Mapa de Leads
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-zinc-500 font-bold uppercase text-[10px] tracking-widest px-4 flex items-center gap-2"
            >
              <Zap size={12} /> Extração
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 relative">
          <TabsContent value="map" className="h-full bg-black mt-0 border-none outline-none data-[state=active]:flex flex-col">
            <LeadsMap />
          </TabsContent>
          
          <TabsContent value="campaigns" className="h-full bg-black mt-0 overflow-y-auto border-none outline-none">
            <AdminCampaigns />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};

export default AdminMaps;
