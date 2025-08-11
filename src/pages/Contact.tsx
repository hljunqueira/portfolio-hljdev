import { Helmet } from "react-helmet-async";
import { LeadForm } from "@/components/site/LeadForm";

const Contact = () => {
  return (
    <main>
      <Helmet>
        <title>Contato | Hlj.dev</title>
        <meta name="description" content="Entre em contato com Hlj.dev para projetos e parcerias." />
        <link rel="canonical" href="/contact" />
      </Helmet>
      <LeadForm />
    </main>
  );
};

export default Contact;
