import { Flex } from "@mantine/core";
import NameTile from "@/components/NameTile";
import AccountsTile from "@/components/AccountsTile";
import LanguagesTile from "@/components/LanguagesTile";
import FrameworksTile from "@/components/FrameworksTile";

export default function Home() {
  return (
    <main>
      <Flex h="100vh" style={{ overflowX: "scroll" }}>
        <NameTile />
        <AccountsTile />
        <LanguagesTile />
        <FrameworksTile />
      </Flex>
    </main>
  );
}
