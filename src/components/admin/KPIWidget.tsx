import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPIWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export function KPIWidget({ title, value, icon: Icon, color = "text-primary", trend }: KPIWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-primary/30 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2 rounded-xl bg-zinc-800 group-hover:bg-primary/10 transition-colors">
          <Icon className={`h-5 w-5 ${color} group-hover:text-primary transition-colors`} />
        </div>
        {trend && (
          <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-black text-white mb-1 tracking-tighter">
          {value}
        </div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {title}
        </div>
      </div>
    </motion.div>
  );
}
