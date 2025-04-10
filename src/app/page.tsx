import { Flex } from "@mantine/core";
import NameTile from "@/tiles/NameTile";
import AccountsTile from "@/tiles/AccountsTile";
import LanguagesTile from "@/tiles/LanguagesTile";
import FrameworksTile from "@/tiles/FrameworksTile";
import ProductsTile from "@/tiles/ProductsTile";
import LastTile from "@/tiles/LastTile";
import profile from "@/profile.json";

export default function Home() {
  return (
    <main>
      <Flex h="100vh" style={{ overflowX: "scroll" }}>
        <NameTile />
        <AccountsTile accounts={profile.accounts} />
        <LanguagesTile languages={profile.languages} />
        <FrameworksTile frameworks={profile.frameworks} />
        <ProductsTile products={profile.products} colors={profile.colors} />
        <LastTile />
      </Flex>
    </main>
  );
}
