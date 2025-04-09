import { Card, Flex, Rating, SimpleGrid, Title } from "@mantine/core";
import { Language } from "@/models";

const LanguagesTile = ({ languages }: { languages: Language[] }) => {
  return (
    <Flex
      w="100vw"
      h="100vh"
      bg="cyan.9"
      align="center"
      justify="center"
    >
      <SimpleGrid
        w="100vw"
        px={{
          base: 20,
          sm: 20,
          md: 20,
          lg: 100,
          xl: 100,
        }}
        py={50}
        cols={{
          base: 3,
          xs: 3,
          sm: 4,
          md: 6,
          lg: 6,
          xl: 8,
        }}
      >
        {languages.map((language) => (
          <Card key={language.name} miw={130}>
            <Title order={5}>{language.name}</Title>
            <Rating readOnly fractions={10} value={language.rate} />
          </Card>
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default LanguagesTile;
