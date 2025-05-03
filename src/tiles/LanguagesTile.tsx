import { Box, Card, Flex, Rating, ScrollArea, SimpleGrid, Title } from "@mantine/core";
import { Language } from "@/models";

const LanguagesTile = ({ languages }: { languages: Language[] }) => {
  return (
    <Box w="100vw" bg="cyan.9">
      <ScrollArea h="100%" scrollbars="y">
        <Flex
          w="100vw"
          mih="100dvh"
          align="center"
          justify="center"
        >
          <SimpleGrid
            w="100%"
            py={50}
            px={{
              base: 20,
              sm: 20,
              md: 20,
              lg: 100,
              xl: 100,
            }}
            cols={{
              base: 2,
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
      </ScrollArea>
    </Box>
  );
};

export default LanguagesTile;
