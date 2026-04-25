
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'HLJ-DEV-Portfolio' } });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error('Erro geocoding:', address, err.message);
  }
  return null;
}

async function fixLeads() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, endereco')
    .is('latitude', null); // Or just update everything for now

  console.log(`Buscando ${leads?.length || 0} leads para corrigir...`);

  const { data: allLeads } = await supabase.from('leads').select('id, endereco');
  
  for (const lead of allLeads) {
    if (!lead.endereco) continue;
    
    console.log(`Geocodificando: ${lead.endereco}...`);
    const coords = await geocodeAddress(lead.endereco);
    
    if (coords) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          latitude: coords.lat,
          longitude: coords.lon
        })
        .eq('id', lead.id);
      
      if (updateError) console.error('Erro update:', updateError);
      else console.log(`✅ Sucesso: ${lead.endereco} -> ${coords.lat}, ${coords.lon}`);
    } else {
      console.log(`❌ Falha: ${lead.endereco}`);
    }
    
    // Wait a bit to respect Nominatim usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

fixLeads();
