import {
  ITagHandler, TagNode,
} from '@cc98/ubb-core'

import { IContext } from '@cc98/context'

import React from 'react'
import { css } from 'emotion'

const handler: ITagHandler<React.ReactNode> = {
  isRecursive: true,

  render(node: TagNode, context: IContext, children: React.ReactNode[]) {
    const cursor = node.tagData.cursor

    const style = css`
    cursor: ${cursor};
    `
    return (
      <span className={style}>
        {children}
      </span>
    )
  },
}

export default handler
