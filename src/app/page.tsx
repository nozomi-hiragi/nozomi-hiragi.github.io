import { Flex } from "@mantine/core";
import NameTile from "@/components/NameTile";
import AccountsTile from "@/components/AccountsTile";

export default function Home() {
  return (
    <main>
      <Flex h="100vh" style={{ overflowX: "scroll" }}>
        <NameTile />
        <AccountsTile />
      </Flex>
    </main>
  );
}
