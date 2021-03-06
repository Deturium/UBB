import {
  NodeType, ChildNode,
  RootNode, TextNode, TagNode,
} from './parse'

/**
 * 自定义上下文，在 DFS 时共享
 */
export interface IContext {
  [key: string]: any
}


interface RecursiveTagHandler<T> {
  /** 是否递归处理子标签 */
  isRecursive: true
  /** 进入节点时触发 */
  enter?(node: TagNode, context: IContext): void
  /** 离开节点时触发 */
  exit?(node: TagNode, context: IContext): void
  /** 渲染该节点，返回渲染结果 */
  render(node: TagNode, context: IContext, children: T[]): T
}

interface NotRecursiveTagHandler<T> {
  isRecursive: false
  enter?(node: TagNode, context: IContext): void
  exit?(node: TagNode, context: IContext): void
  render(node: TagNode, context: IContext): T
}

interface RecursiveGeneralTagHandler<T> extends RecursiveTagHandler<T> {
  /** 匹配标签的正则 */
  match: RegExp
}

interface NotRecursiveGeneralTagHandler<T> extends NotRecursiveTagHandler<T> {
  match: RegExp
}

export type IRootHandler<T> = {
  enter(node: RootNode, context: IContext): void
  exit(node: RootNode, context: IContext): void
  render(node: RootNode, context: IContext, children: T[]): T
}

export type ITagHandler<T> = RecursiveTagHandler<T> | NotRecursiveTagHandler<T>

export type IGeneralTagHandler<T> = RecursiveGeneralTagHandler<T> | NotRecursiveGeneralTagHandler<T>

export type ITextHandler<T> = {
  render(node: TextNode, context: IContext): T
}


/**
 * 所有节点 Handler 的集合
 */
export interface IHandlerHub<T> {
  /** 根节点 Handler */
  rootHandler: IRootHandler<T>

  /** 具名 tag 节点 Handler */
  specificTagHandlers: {
    [key: string]: ITagHandler<T>
  }
  /** 通配 tag 节点 Handler（HINT: 注意处理顺序） */
  generalTagHandlers: IGeneralTagHandler<T>[]

  /** 默认 TagHandler */
  defaultTagHandler: ITagHandler<T>

  /** 文本节点 Handler */
  textHandler: ITextHandler<T>
}

/**
 * DFS 处理一个节点（不能是根节点）
 * @param node 处理节点
 * @param handlerHub 处理函数
 * @param context 上下文
 */
export function handleNode<T>(node: ChildNode, handlerHub: IHandlerHub<T>, context: IContext): T {
  if (node.type === NodeType.TAG) {
    // HANDLE TAG_NODE
    const tagNode = node as TagNode
    const tagName = tagNode.tagName
    let tagHandler!: ITagHandler<T>

    if (tagNode._isClose && handlerHub.specificTagHandlers[tagName]) {
      tagHandler = handlerHub.specificTagHandlers[tagName]

    } else {
      // 如果具名没有则查找通配 Handler
      let match = false

      for (let generalTagHandler of handlerHub.generalTagHandlers) {
        if (generalTagHandler.match.test(tagName)) {
          tagHandler = generalTagHandler
          match = true
          break
        }
      }

      if (!match) {
        // 如果都不匹配则使用默认 Handler
        tagHandler = handlerHub.defaultTagHandler
      }
    }

    let ret: T
    // enter the node
    tagHandler.enter && tagHandler.enter(tagNode, context)

    if (tagHandler.isRecursive) {
      const children = tagNode.children.map(child => handleNode<T>(child, handlerHub, context))
      ret = tagHandler.render(tagNode, context, children)
    } else {
      ret = tagHandler.render(tagNode, context)
    }

    // exit the node
    tagHandler.exit && tagHandler.exit(tagNode, context)

    return ret

  } else {
    // HANDLE TEXT_NODE
    return handlerHub.textHandler.render(node as TextNode, context)
  }
}

function rootDfs<T>(root: RootNode, handlerHub: IHandlerHub<T>, context: IContext):T {
  // 初始化上下文工作
  handlerHub.rootHandler.enter(root, context)

  const children = root.children.map(child => handleNode<T>(child, handlerHub, context))
  const output = handlerHub.rootHandler.render(root, context, children)

  // 清理和收尾
  handlerHub.rootHandler.exit(root, context)
  return output
}

/**
 * DFS 构造目标输出
 * @param root AST 根节点
 * @param handlerHub
 * @param initContext
 */
export function build<T>(root: RootNode, handlerHub: IHandlerHub<T>, initContext: IContext): T {
  return rootDfs<T>(root, handlerHub, initContext)
}
