"use client";
import { useState } from "react";
import { Card, Avatar, SegmentedControl, Group, Badge, Text } from "@mantine/core";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { EmblaCarouselType } from "embla-carousel";
import { About } from "@/models";

const langs = [
  { value: "en", label: "🇬🇧 English" },
  { value: "ja", label: "🇯🇵 日本語" },
  { value: "ko", label: "🇰🇷 한국어" },
]

const AboutCard = ({ about }: { about: About }) => {
  const [value, setValue] = useState(window.navigator.language.split("-")[0] || "en");
  const [emblaRef, seteEblaRef] = useState<EmblaCarouselType>()

  return (
    <Card maw={400} mx={20} px={20} shadow="sm" radius="md">
      <Avatar
        mx="auto"
        mb="sm"
        size={80}
        src={about.avatar}
      />
      <SegmentedControl
        value={value}
        onChange={(value: string) => {
          setValue(value);
          emblaRef?.scrollTo(langs.findIndex((lang) => lang.value === value))
        }}
        data={langs}
      />
      <Carousel withControls={false} getEmblaApi={(embla: EmblaCarouselType) => {
        seteEblaRef(embla);
        embla.scrollTo(langs.findIndex((lang) => lang.value === value))
      }}>
        <CarouselSlide>
          <Text mt="xs" size="sm" style={{ whiteSpace: "pre-wrap" }} ta="center" fz="lg" fw={500}>{about.name}</Text>
          <Text mt="xs" size="sm" style={{ whiteSpace: "pre-wrap" }} ta="center">{about.bio}</Text>
        </CarouselSlide>
        <CarouselSlide>
          <Text mt="xs" size="sm" style={{ whiteSpace: "pre-wrap" }} ta="center" fz="lg" fw={500}>{about.name_ja}</Text>
          <Text mt="xs" size="sm" style={{ whiteSpace: "pre-wrap" }} ta="center">{about.bio_ja}</Text>
        </CarouselSlide>
        <CarouselSlide>
          <Text mt="xs" size="sm" style={{ whiteSpace: "pre-wrap" }} ta="center" fz="lg" fw={500}>{about.name_ko}</Text>
          <Text mt="xs" size="sm" style={{ whiteSpace: "pre-wrap" }} ta="center">{about.bio_ko}</Text>
        </CarouselSlide>
      </Carousel>
      <Text mt="xs" size="sm" ta="center">🗾 {about.location}</Text>
      <Group gap={10} mt="sm">
        {about.interests.map((interest, i) => (
          <Badge key={i} size="xs" color="grape">
            {interest}
          </Badge>
        ))}
      </Group>
    </Card>
  );
}

export default AboutCard;
