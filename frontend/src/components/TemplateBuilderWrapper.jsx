import { useParams, useLocation } from "react-router-dom";
import TemplateBuilder from "./TemplateBuilder";

export default function TemplateBuilderWrapper() {
  const { templateId } = useParams();
    const location = useLocation();
  const content = location.state?.content || null;

  return <TemplateBuilder selectedTemplate={templateId} resumeData={content}     resumeId={location.state?.resumeId}
      resumeTitle={location.state?.title} />;
}
