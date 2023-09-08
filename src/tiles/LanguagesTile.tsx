import { Card, Flex, Group, Rating, Title } from "@mantine/core";
import { Language } from "@/models";

const LanguagesTile = ({ languages }: { languages: Language[] }) => {
  return (
    <Flex
      h="100vh"
      bg="cyan.9"
      px={80}
      py={50}
      align="center"
      justify="center"
    >
      <Group gap={50} style={{ flexWrap: "nowrap" }}>
        {languages.map((language) => (
          <Card key={language.name}>
            <Title order={5}>{language.name}</Title>
            <Rating readOnly fractions={10} value={language.rate} />
          </Card>
        ))}
      </Group>
    </Flex>
  );
};

export default LanguagesTile;
