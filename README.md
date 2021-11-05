# “Librarian” for Git Things Done

Automation that automatically labels your GitTD tickets based on content.


## Usage

Currently we support the following labels:

* lol
* inspiration
* audit
* journal

New comments that are titled with the above will be labeled accordingly.

Additionally if a `# Fortune` comment is `+1`’d we label the ticket with
`good-fortune`.


## Installation

Requires [GitTD][].

> ***Note***, if you forked our [template repository][GitTD] you already have this.

Add `.github/workflows/librarian.yml`:

```yaml
on:
  issue_comment:
    types:
      - created
      - edited
      - deleted
jobs:
  parse:
    runs-on: ubuntu-latest
    if: github.event.issue_comment.user.login != 'github-actions[bot]'
    steps:
      - uses: git-things-done/librarian@master
        id: labels
        with:
          today: ${{ github.event.issue.number }}

      - uses: KeisukeYamashita/attach-labels@v1
        if: ${{ steps.labels.outputs.append }}
        with:
          labels: ${{ steps.labels.outputs.append }}
          number: ${{ github.event.issue.number }}

      - uses: peter-murray/remove-labels-action@v1
        if: ${{ steps.labels.outputs.remove }}
        with:
          labels: ${{ steps.labels.outputs.remove }}
          issue_number: ${{ github.event.issue.number }}
```


[GitTD]: https://github.com/git-things-done/gtd
