import {
  Button,
  Card,
  Flex,
  Group,
  Pill,
  Stack,
  Text,
  Title,
} from "@mantine/core";

type ProductLink = {
  label: string;
  url: string;
  color?: string;
};
type Product = {
  name: string;
  description: string;
  tags?: string[];
  links?: ProductLink[];
};

const products: Product[] = [{
  name: "Yowatari",
  description: "VRChat world explorer",
  tags: ["React", "Deno", "Next.js", "Mantine", "TypeScript"],
  links: [{
    label: "Website",
    url: "https://yowatari.link/",
    color: "green.9",
  }],
}, {
  name: "EbinaStation",
  description: "Server application manager",
  tags: ["React", "Deno", "Next.js", "Mantine", "TypeScript"],
  links: [{
    label: "Repository",
    url: "https://github.com/nozomi-hiragi/ebina-station",
  }, {
    label: "Website",
    url: "https://nozomi-hiragi.github.io/ebina-station/",
  }],
}, {
  name: "TweetHistory",
  description: "Tweet archive viewing and grouping tool",
  tags: ["React", "Next.js", "Mantine", "TypeScript"],
  links: [{
    label: "Repository",
    url: "https://github.com/nozomi-hiragi/TweetHistory/",
  }, {
    label: "Website",
    url: "https://nozomi-hiragi.github.io/TweetHistory/",
  }],
}, {
  name: "Tansaku",
  description: "Flutter Web demo",
  tags: ["Flutter", "Dart"],
  links: [{
    label: "Repository",
    url: "https://github.com/nozomi-hiragi/Tansaku",
  }, {
    label: "Website",
    url: "https://nozomi-hiragi.github.io/Tansaku",
  }],
}, {
  name: "VRCMate",
  description: "VRChat friends status checker",
  tags: ["Android", "Kotlin"],
  links: [{
    label: "Vestige",
    url:
      "https://twitter.com/search?q=%23VRCMate%20from%3Anozomi_hiragi&f=live",
    color: "violet",
  }],
}];

const ProductsTile = () => {
  return (
    <Flex
      h="100vh"
      bg="indigo.7"
      px={80}
      py={50}
      align="center"
      justify="center"
    >
      <Group gap={50} style={{ flexWrap: "nowrap" }}>
        {products.map((product) => (
          <Card miw={260}>
            <Stack>
              <Title order={3}>{product.name}</Title>
              <Text>{product.description}</Text>
              {product.tags && (
                <Flex gap="xs" wrap="wrap">
                  {product.tags.map((tag) => <Pill>{tag}</Pill>)}
                </Flex>
              )}
              {product.links && (
                <Group justify="flex-end">
                  {product.links.map((link) => (
                    <Button
                      component="a"
                      target="_blank"
                      href={link.url}
                      variant="subtle"
                      color={link.color}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Group>
              )}
            </Stack>
          </Card>
        ))}
      </Group>
    </Flex>
  );
};

export default ProductsTile;
