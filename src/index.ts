import * as github from '@actions/github'
import { getInput, setOutput } from '@actions/core'
import { categorize } from './categorize().js'
import { IssueCommentEvent } from '@octokit/webhooks-definitions/schema'

const slug = process.env.GITHUB_REPOSITORY!
const [owner, repo] = slug.split('/')
const issue_number = parseInt((getInput('today') || process.env.GTD_TODAY)!)
const token = getInput('token')!
const octokit = github.getOctokit(token);
const comment_id = (github.context.payload as IssueCommentEvent).comment.id

const comments = await octokit.rest.issues.listComments({
  owner,
  repo,
  issue_number,
})

const upstream = await octokit.rest.issues.listLabelsOnIssue({
  owner,
  repo,
  issue_number,
}).then(({ data }) =>
  new Set(data.map(label => label.name))
)

const getRxnsForIssueComment = (comment_id: number) => octokit.rest.reactions.listForIssueComment({
  owner,
  repo,
  comment_id
}).then(({ data }) =>
  new Set(data.map(rxn => rxn.content))
)

const desiredLabels = await categorize(
  comments.data,
  upstream,
  getRxnsForIssueComment
)

const appends = [...desiredLabels].filter(x => !upstream.has(x))
const zombies = [...upstream].filter(x => !desiredLabels.has(x))

setOutput('labels', [...desiredLabels])
setOutput('append', appends.join())
setOutput('remove', zombies.join())
