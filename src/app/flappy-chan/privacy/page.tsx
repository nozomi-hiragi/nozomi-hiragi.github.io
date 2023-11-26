import { Container } from "@mantine/core";
import DocumentPaper from "../../../components/DocumentPaper";
import document from "./privacy-policy.json"

const Privacy = () => {
  return (
    <main>
      <Container p="xl">
        <DocumentPaper document={document} />
      </Container>
    </main>
  );
}

export default Privacy
