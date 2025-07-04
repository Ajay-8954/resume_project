import { useParams } from "react-router-dom";
import TemplateBuilder from "./TemplateBuilder";

export default function TemplateBuilderWrapper() {
  const { templateId } = useParams();
  return <TemplateBuilder selectedTemplate={templateId} />;
}
