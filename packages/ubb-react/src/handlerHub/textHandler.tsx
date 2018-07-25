import {
  ITextHandler,
  TextNode, IContent,
} from 'ubb-core'

import * as  React from 'react'

const handler: ITextHandler<React.ReactNode> = {
  render(node: TextNode, content: IContent) {
    return node.text
  },
}

export default handler