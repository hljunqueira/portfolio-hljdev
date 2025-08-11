import { Helmet } from "react-helmet-async";
import { ProjectsGrid } from "@/components/site/ProjectsGrid";

const Projects = () => {
  return (
    <main>
      <Helmet>
        <title>Projetos | Hlj.dev</title>
        <meta name="description" content="Projetos de desenvolvimento web por Hlj.dev." />
        <link rel="canonical" href="/projects" />
      </Helmet>
      <ProjectsGrid />
    </main>
  );
};

export default Projects;
