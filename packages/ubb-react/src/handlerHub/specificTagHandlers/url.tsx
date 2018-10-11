import {
  ITagHandler, TagNode,
} from '@cc98/ubb-core'

import { IContent } from '@cc98/content'

import React from 'react'
import URL from 'url-parse'

// Avoid XSS:
// https://medium.com/javascript-security/avoiding-xss-in-react-is-still-hard-d2b5c7ad9412
function isSafe(dangerousURL: string) {
  const url = URL(dangerousURL.trim(), {})
  if (url.protocol === 'http:') return true
  if (url.protocol === 'https:') return true
  return false
}

const handler: ITagHandler<React.ReactNode> = {
  isRecursive: false,

  render(node: TagNode, content: IContent) {
    const innerText = node.innerText
    const dangerousURL  = node.tagData.url || innerText

    const safeURL = isSafe(dangerousURL) ? dangerousURL : undefined

    return (
      <a href={safeURL}>{innerText}</a>
    )
  },
}

export default handler
