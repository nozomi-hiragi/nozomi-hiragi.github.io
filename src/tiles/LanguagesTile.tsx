import { Card, Flex, Group, Rating, Title } from "@mantine/core";

const languages = [
  { name: "C++", rate: 3.2 },
  { name: "Dart", rate: 3.5 },
  { name: "Java", rate: 3.5 },
  { name: "Kotlin", rate: 3.4 },
  { name: "Golang", rate: 3.3 },
  { name: "Rust", rate: 3 },
  { name: "TypeScript", rate: 4.3 },
  { name: "JavaScript", rate: 2.4 },
  { name: "C#", rate: 2 },
  { name: "HTML", rate: 2.8 },
  { name: "CSS", rate: 2.2 },
  { name: "Python", rate: 0.5 },
  { name: "PHP", rate: 0.3 },
  { name: "日本語", rate: 4.8 },
  { name: "English", rate: 3.2 },
  { name: "한국어", rate: 1.8 },
];

const LanguagesTile = () => {
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
          <Card>
            <Title order={5}>{language.name}</Title>
            <Rating readOnly fractions={10} value={language.rate} />
          </Card>
        ))}
      </Group>
    </Flex>
  );
};

export default LanguagesTile;
