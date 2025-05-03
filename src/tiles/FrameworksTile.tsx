import { Box, Card, Flex, Rating, ScrollArea, SimpleGrid, Title } from "@mantine/core";
import { Framework } from "@/models";

const FrameworksTile = ({ frameworks }: { frameworks: Framework[] }) => {
  return (
    <Box w="100vw" bg="lime.9">
      <ScrollArea h="100%" scrollbars="y">
        <Flex
          w="100vw"
          mih="100dvh"
          align="center"
          justify="center"
        >
          <SimpleGrid
            w="100vw"
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
            {frameworks.map((framework) => (
              <Card key={framework.name}>
                <Title order={5}>{framework.name}</Title>
                <Rating readOnly fractions={10} value={framework.rate} />
              </Card>
            ))}
          </SimpleGrid>
        </Flex >
      </ScrollArea>
    </Box>
  );
};

export default FrameworksTile;
