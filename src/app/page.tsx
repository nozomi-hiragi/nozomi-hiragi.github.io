import { Flex } from "@mantine/core";
import NameTile from "@/tiles/NameTile";
import AccountsTile from "@/tiles/AccountsTile";
import LanguagesTile from "@/tiles/LanguagesTile";
import FrameworksTile from "@/tiles/FrameworksTile";
import ProductsTile from "@/tiles/ProductsTile";

export default function Home() {
  return (
    <main>
      <Flex h="100vh" style={{ overflowX: "scroll" }}>
        <NameTile />
        <AccountsTile />
        <LanguagesTile />
        <FrameworksTile />
        <ProductsTile />
      </Flex>
    </main>
  );
}
