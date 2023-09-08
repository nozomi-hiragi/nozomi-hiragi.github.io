import { ActionIcon, ActionIconProps } from "@mantine/core";

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

export default AccountActionIcon;
