import { Roboto_Mono } from "next/font/google";
import { Flex, Title } from "@mantine/core";

const Lato700 = Roboto_Mono({
  weight: "200",
  preload: false,
});

const NameTile = () => {
  return (
    <Flex
      w={{
        base: "90vw",
        xs: "80vw",
        sm: "70vw",
        lg: "60vw",
        xl: "50vw",
      }}
      h="100dvh"
      justify="center"
      align="center"
      bg="violet.7"
      style={{ flexShrink: 0 }}
    >
      <Title
        className={Lato700.className}
        c="white"
        order={1}
        size={40}
        mb={20}
      >
        nozomi hiragi
      </Title>
    </Flex>
  );
};

export default NameTile;
