"use client";
import {
  FloatingPosition,
  MantineTransition,
  Text,
  Tooltip,
  TooltipProps,
} from "@mantine/core";
import { useState } from "react";

const alignList = ["", "-start", "-end"];
const positionList = ["top", "right", "bottom", "left"];
const colorList = [
  "dark",
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "green",
  "lime",
  "yellow",
  "orange",
  "teal",
];

const randomInt = (max: number) => Math.floor((Math.random() * 100) % max);
const randomList = (list: string[]) => list[randomInt(list.length)];
const randomPosition = () => randomList(positionList);
const randomAlign = () => randomList(alignList);
const randomColor = () => randomList(colorList);
const randomColorNum = () => randomInt(10);
const positionToTranslation = (pos: string) => {
  switch (pos) {
    case "top":
      return "up";
    case "bottom":
      return "down";
    default:
      return pos;
  }
};

const randomParams = () => {
  const colorNum = randomColorNum();
  const position = randomPosition();
  const params = {
    color: randomColor() + "." + colorNum,
    labelColor: colorNum < 5 ? "dark.9" : "gray.0",
    position: position + randomAlign() as FloatingPosition,
    translation: `slide-${
      positionToTranslation(position)
    }` as MantineTransition,
  };
  return params;
};

const RandomToolTip = ({ children, label, ...props }:
  & Omit<TooltipProps, "label">
  & { label: string }) => {
  const [params, setParams] = useState(randomParams());
  return (
    <Tooltip
      withArrow
      arrowSize={10}
      position={params.position}
      transitionProps={{ transition: params.translation, duration: 300 }}
      color={params.color}
      onMouseEnter={() => setParams(randomParams())}
      label={<Text c={params.labelColor}>{label}</Text>}
      {...props}
    >
      {children}
    </Tooltip>
  );
};
export default RandomToolTip;
