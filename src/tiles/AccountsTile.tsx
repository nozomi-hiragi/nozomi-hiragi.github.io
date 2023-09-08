import { ActionIcon, ActionIconProps, Flex, Group } from "@mantine/core";
import { getIcon } from "@/components/Icons";
import RandomToolTip from "../components/RandomTooltip";

const AccountActionIcon = (
  props: ActionIconProps & { children: React.ReactNode; href?: string },
) => {
  return (
    <ActionIcon
      component="a"
      target="_blank"
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
    label: "ひいらぎのぞみ",
    icon: "twitter",
    gradient: { from: "teal", to: "blue", deg: 90 },
    url: "https://twitter.com/nozomi_hiragi",
  },
  {
    label: "Nozomi Hiragi",
    gradient: { from: "blue", to: "violet", deg: 90 },
    icon: "twitter",
    url: "https://twitter.com/nozomi_hilagi",
  },
  {
    label: "히라기 노조미",
    gradient: { from: "violet", to: "pink", deg: 90 },
    icon: "twitter",
    url: "https://twitter.com/nojomi_hiragi",
  },
  {
    label: "Twitch",
    gradient: { from: "rgb(90,62,133)", to: "violet", deg: 110 },
    icon: "twitch",
    url: "https://www.twitch.tv/nozomi_hiragi",
  },
  {
    label: "Re:nozomi hiragi",
    gradient: { from: "violet.9", to: "indigo.8", deg: 100 },
    icon: "youtube",
    url: "https://www.youtube.com/channel/UCGfXzcqUc7pn8f1WQ-zk6zA",
  },
  {
    label: "ひいらぎのぞみの趣味",
    gradient: { from: "orange.6", to: "yellow.7", deg: 110 },
    icon: "youtube",
    url: "https://www.youtube.com/channel/UCi5z7odZ5FzDQIMi1pT5q0g",
  },
  {
    label: "Nozomi from Japan",
    gradient: { from: "green", to: "lime.6", deg: 110 },
    icon: "youtube",
    url: "https://www.youtube.com/channel/UCb2KFFsK2387E594oc_xYFA",
  },
  {
    label: "GitHub",
    gradient: { from: "dark", to: "gray", deg: 90 },
    icon: "github",
    url: "https://github.com/nozomi-hiragi",
  },
  {
    label: "Hatena Blog",
    gradient: { from: "gray.0", to: "gray.2", deg: 110 },
    icon: "hatenablog",
    url: "https://nozomi-hiragi.hatenablog.com/",
  },
  {
    label: "Zenn",
    gradient: { from: "rgb(62,168,255)", to: "blue", deg: 110 },
    icon: "zenn",
    url: "https://zenn.dev/nozomi_hiragi",
  },
  {
    label: "Booth",
    gradient: { from: "red", to: "orange", deg: 110 },
    icon: "booth",
    url: "https://nozomi-hiragi.booth.pm/",
  },
  {
    label: "Fanbox",
    gradient: { from: "rgb(35,24,22)", to: "rgb(43,51,60)", deg: 110 },
    icon: "fanbox",
    url: "https://nozomi-hiragi.fanbox.cc/",
  },
  {
    label: "Patreon",
    gradient: { from: "rgb(255,66,77)", to: "red", deg: 110 },
    icon: "patreon",
    url: "https://www.patreon.com/nozomi_hiragi",
  },
  {
    label: "Amazon Wishlist",
    gradient: { from: "rgb(254, 156, 21)", to: "yellow", deg: 110 },
    icon: "amazon",
    url:
      "https://www.amazon.co.jp/registry/wishlist/RSOGC7R8DVLP/ref=cm_sw_r_cp_ep_ws_-Y-5Bb04SS5P4",
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
          <RandomToolTip
            label={account.label}
          >
            <AccountActionIcon
              variant="gradient"
              gradient={account.gradient}
              aria-label={account.label}
              href={account.url}
            >
              {getIcon(account.icon)({ size: 40 })}
            </AccountActionIcon>
          </RandomToolTip>
        ))}
      </Group>
    </Flex>
  );
};

export default AccountsTile;
