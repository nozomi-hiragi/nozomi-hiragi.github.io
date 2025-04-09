import { Card, Flex, Rating, SimpleGrid, Title } from "@mantine/core";
import { Framework } from "@/models";

const FrameworksTile = ({ frameworks }: { frameworks: Framework[] }) => {
  return (
    <Flex
      w="100vw"
      h="100vh"
      bg="lime.9"
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
        {frameworks.map((framework) => (
          <Card key={framework.name}>
            <Title order={5}>{framework.name}</Title>
            <Rating readOnly fractions={10} value={framework.rate} />
          </Card>
        ))}
      </SimpleGrid>
    </Flex >
  );
};

export default FrameworksTile;
