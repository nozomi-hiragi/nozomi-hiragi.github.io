"use client"
import { Paper, Title, Text, Box, Stack } from "@mantine/core";

export type Document = {
  title: string
  description: string
  sections: {
    heading: string
    contents?: Content[]
  }[]
  date: string
}

type Content = string | {
  text?: string
  list?: Content[]
}

const unpackMkLink = (text: string) => {
  return <>{text.split(/(\[.+\]\(.+\))/).map((it, i) => {
    const res = /\[(.+)\]\((.+)\)/.exec(it)
    return res ? <a key={i} href={res[2]}>{res[1]}</a> : it
  })}</>
}

const UnpackContent = ({ content }: { content: Content }) => {
  if (typeof content === "string") {
    return <Text m="0">{unpackMkLink(content)}</Text>
  }
  return (<>
    {content.text && <Text m={0}>{content.text}</Text>}
    {content.list && <Box component="ol" m={0}>
      {content.list.map((it, i) => <li key={i}><UnpackContent content={it} /></li>)}
    </Box>}
  </ >
  )
}

const DocumentPaper = ({ document }: { document: Document }) => {
  return (
    <Paper p="md" withBorder>
      <Stack>
        <Title order={1}>{document.title}</Title>
        <Text>{document.description}</Text>
        {document.sections.map(({ heading, contents }) => {
          return <Stack key={heading} gap="xs">
            <Title order={3}>{heading}</Title>
            {contents && contents.map((content: Content, i) => {
              return <UnpackContent key={i} content={content} />
            })}
          </Stack>
        })}
        <Text>{document.date}</Text>
      </Stack>
    </Paper>
  );
}

export default DocumentPaper
