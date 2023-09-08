import { Card, Flex, Group, Rating, Title } from "@mantine/core";

const frameworks = [
  { name: "Deno", rate: 4.8 },
  { name: "Node.js", rate: 4 },
  { name: "React", rate: 4.5 },
  { name: "Mantie", rate: 4.5 },
  { name: "Next.js", rate: 4 },
  { name: "Flutter", rate: 3 },
  { name: "Android", rate: 2.4 },
  { name: "Godot", rate: 2 },
  { name: "DirectX 9", rate: 2.8 },
  { name: "DirectX 11", rate: 2.3 },
  { name: "DirectX 12", rate: 2 },
  { name: "Vulkan", rate: 2 },
  { name: "Unity", rate: 1 },
];

const FrameworksTile = () => {
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
