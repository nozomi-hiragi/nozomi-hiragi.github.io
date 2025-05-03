import { Box, Flex, ScrollArea } from "@mantine/core";
import { About } from "@/models";
import AboutCard from "@/components/AboutCard";

const AboutTile = ({ about }: { about: About }) => {
  return (
    <Box w="100vw" bg="orange.4">
      <ScrollArea h="100%" scrollbars="y">
        <Flex
          w="100vw"
          mih="100dvh"
          py={20}
          align="center"
          justify="center"
        >
          <AboutCard about={about} />
        </Flex >
      </ScrollArea>
    </Box >
  );
};

export default AboutTile;
