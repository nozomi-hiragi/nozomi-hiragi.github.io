import { Product } from "@/models";
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

const ProductsTile = ({ products }: { products: Product[] }) => {
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
          <Card key={product.name} miw={260}>
            <Stack>
              <Title order={3}>{product.name}</Title>
              <Text>{product.description}</Text>
              {product.tags && (
                <Flex gap="xs" wrap="wrap">
                  {product.tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}
                </Flex>
              )}
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
      </Group>
    </Flex>
  );
};

export default ProductsTile;
