import { lexer } from 'marked'

interface IssueComment {
  id: number
  body?: string
}

export async function categorize(comments: IssueComment[], upstream: Set<string>, getRxns: (id: number) => Promise<Set<string>>): Promise<Set<string>> {
  const rv = new Set([...upstream])

  for (const comment of comments) {
    if (!comment.body) continue
    comment: for (const item of lexer(comment.body)) {
      if (item.type !== 'heading') continue
      const squished = squish(item.text)
      switch (squished) {
      case 'fortune':
        if (!(await getRxns(comment.id)).has('+1')) {
          break comment;
        } else {
          // fall through
        }
      case 'inspiration':
      case 'realization':
      case 'journal':
      case 'audit':
      case 'lol':
        rv.add(squished)
        break comment;
      default:
        break comment;
      }
    }
  }

  return rv
}

function squish(input: string): string {
  return input.toLowerCase().replace(/(\s|-)+/g, '').trim()
}
