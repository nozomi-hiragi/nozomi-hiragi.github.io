import { ActionIcon, ActionIconProps, Flex, Group } from "@mantine/core";
import {
  IconAmazon,
  IconBooth,
  IconFanbox,
  IconGithub,
  IconHatenaBlog,
  IconPatreon,
  IconTwitch,
  IconTwitter,
  IconYouTube,
  IconZenn,
} from "@/components/Icons";

const AccountActionIcon = (
  props: ActionIconProps & { children: React.ReactNode },
) => {
  return (
    <ActionIcon
      size={70}
      radius="md"
      {...props}
    >
      {props.children}
    </ActionIcon>
  );
};

const accounts = [
  {
    label: "Twitter JA",
    icon: IconTwitter,
    gradient: { from: "teal", to: "blue", deg: 90 },
  },
  {
    label: "Twitter EN",
    gradient: { from: "blue", to: "violet", deg: 90 },
    icon: IconTwitter,
  },
  {
    label: "Twitter KO",
    gradient: { from: "violet", to: "pink", deg: 90 },
    icon: IconTwitter,
  },
  {
    label: "Twitch",
    gradient: { from: "rgb(90,62,133)", to: "violet", deg: 110 },
    icon: IconTwitch,
  },
  {
    label: "YouTube",
    gradient: { from: "violet.9", to: "indigo.8", deg: 100 },
    icon: IconYouTube,
  },
  {
    label: "YouTube Hobbies",
    gradient: { from: "orange.6", to: "yellow.7", deg: 110 },
    icon: IconYouTube,
  },
  {
    label: "YouTube Travel",
    gradient: { from: "green", to: "lime.6", deg: 110 },
    icon: IconYouTube,
  },
  {
    label: "GitHub",
    gradient: { from: "dark", to: "gray", deg: 90 },
    icon: IconGithub,
  },
  {
    label: "Hatena Blog",
    gradient: { from: "gray.0", to: "gray.2", deg: 110 },
    icon: IconHatenaBlog,
  },
  {
    label: "Zenn",
    gradient: { from: "rgb(62,168,255)", to: "blue", deg: 110 },
    icon: IconZenn,
  },
  {
    label: "Booth",
    gradient: { from: "red", to: "orange", deg: 110 },
    icon: IconBooth,
  },
  {
    label: "Fanbox",
    gradient: { from: "rgb(35,24,22)", to: "rgb(43,51,60)", deg: 110 },
    icon: IconFanbox,
  },
  {
    label: "Patreon",
    gradient: { from: "rgb(255,66,77)", to: "red", deg: 110 },
    icon: IconPatreon,
  },
  {
    label: "Amazon Wishlist",
    gradient: { from: "rgb(254, 156, 21)", to: "yellow", deg: 110 },
    icon: IconAmazon,
  },
];

const AccountsTile = () => {
  return (
    <Flex
      h="100vh"
      bg="gray.3"
      px={80}
      py={50}
      align="center"
      justify="center"
    >
      <Group gap={50} style={{ flexWrap: "nowrap" }}>
        {accounts.map((account) => (
          <AccountActionIcon
            variant="gradient"
            gradient={account.gradient}
            aria-label={account.label}
          >
            {account.icon({ size: 40 })}
          </AccountActionIcon>
        ))}
      </Group>
    </Flex>
  );
};

export default AccountsTile;
