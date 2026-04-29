import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function useEvolution() {
  const [isSending, setIsSending] = useState(false);

  const sendFile = async (phone: string, base64File: string, fileName: string) => {
    setIsSending(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

    const url = import.meta.env.VITE_EVOLUTION_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
    const instance = import.meta.env.VITE_EVOLUTION_INSTANCE;

    try {
      const response = await fetch(`${url}/message/sendMedia/${instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: finalPhone,
          media: base64File,
          mediatype: 'document',
          fileName: fileName,
          caption: `Olá! Conforme conversamos, segue a proposta estratégica da HLJ DEV para o seu projeto. 🚀`
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "WhatsApp Enviado!", description: "A proposta foi entregue com sucesso." });
        return true;
      } else {
        throw new Error(data.message || 'Erro ao enviar WhatsApp');
      }
    } catch (error: any) {
      toast({ 
        title: "Erro no WhatsApp", 
        description: error.message, 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendFile, isSending };
}
