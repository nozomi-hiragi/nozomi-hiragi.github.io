import { Card, Flex, Group, Rating, Title } from "@mantine/core";
import { Framework } from "@/models";

const FrameworksTile = ({ frameworks }: { frameworks: Framework[] }) => {
  return (
    <Flex
      h="100vh"
      bg="lime.9"
      px={80}
      py={50}
      align="center"
      justify="center"
    >
      <Group gap={50} style={{ flexWrap: "nowrap" }}>
        {frameworks.map((framework) => (
          <Card key={framework.name}>
            <Title order={5}>{framework.name}</Title>
            <Rating readOnly fractions={10} value={framework.rate} />
          </Card>
        ))}
      </Group>
    </Flex>
  );
};

export default FrameworksTile;
