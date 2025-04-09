import { Colors, Product } from "@/models";
import {
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Pill,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

const ProductsTile = ({ products, colors }: { products: Product[], colors: Colors }) => {
  return (
    <Flex
      w="100vw"
      h="100vh"
      bg="indigo.7"
      align="center"
      justify="center"
    >
      <ScrollArea w="100vw" h="100vh">
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
            base: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
          }}
        >
          {products.map((product) => (
            <Card key={product.name} miw={300}>
              <Stack justify="space-between" h="100%">
                <Stack>
                  <Title order={3}>{product.name}</Title>
                  {product.tags && (
                    <Flex gap="xs" wrap="wrap">
                      <Badge title="status" color={colors.status[product.status]} variant="dot" radius="xl">
                        {product.status}
                      </Badge>
                      {product.tags.map((tag) => {
                        const color = colors.tags[tag];
                        return <Pill key={tag} variant="outline" c={color?.text} bg={color?.background}>{tag}</Pill>
                      }
                      )}
                    </Flex>
                  )}
                  <Text>{product.description}</Text>
                  <Text c="dimmed" size="sm">{product.note}</Text>
                </Stack>
                {product.links && (
                  <Group justify="flex-end">
                    {product.links.map((link) => (
                      <Button
                        key={link.label}
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
        </SimpleGrid>
      </ScrollArea>
    </Flex>
  );
};

export default ProductsTile;
