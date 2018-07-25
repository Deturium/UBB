import {
  ITagHandler,
  TagNode, IContent,
} from 'ubb-core'

import * as React from 'react'

const handler: ITagHandler<React.ReactNode> = {
  isRecursive: true,

  render(node: TagNode, content: IContent, children: React.ReactNode[]) {
    return (
      <span style={{
          fontWeight: 'bold',
        }}>
        { children }
      </span>
    )
  },
}

export default handler