import { Flex, Group } from "@mantine/core";
import { getIcon } from "@/components/Icons";
import RandomToolTip from "@/components/RandomTooltip";
import AccountActionIcon from "@/components/AccountActionIcon";
import { Account } from "@/models";

const AccountsTile = ({ accounts }: { accounts: Account[] }) => {
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
            key={account.label}
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
