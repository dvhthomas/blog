---
title: Git worktrees for local development
date: 2025-11-17T20:38:06-07:00
tags: [git]
toc: true
series: []
summary: Using git worktrees for the first time in local development requires some new muscle memory.
draft: true
images: [git-butler.png]
---

I learned about [git worktrees](https://git-scm.com/docs/git-worktree) from a non-obvious place: [GitButler](https://gitbutler.com/).
GitButler [has a concept](https://docs.gitbutler.com/features/branch-management/integration-branch) of lightweight integration branches managed as a 'workspace' and they are---as far as I can tell---implemented using git worktrees.

{{< figure src="git-butler.png" alt="git butler in-app message about " >}}

I'm so used to my typical local workflow that the benefits of git worktrees took a while to sink in.

## Before

1. `cd ~/my-repo/directory`
2. `git fetch && git pull` -- get the latest
3. `git checkout -b bugfix/some-bug`
4. Work away and possible `git stash` at some point because I need to switch to another branch like `main` or `some-other-feature` mid-flow.
5. `git add .` on my `bugfix/some-bug` branch.
6. `git commit -m "some message"`
7. `git checkout main` then `git fetch && git pull` again to make sure I've got the latest.
8. `git checkout bugfix/some-bug` then `git rebase main` to pull in and resolve any issues re-integrating with `main`.
9. `git checkout main` then `git merge bugfix/some-bug` to merge the changes into `main`.
10. Typically `git push` to push the changes to the remote repository.

## After

1. `mkdir -P ~/projects/cool-project` -- Make a directory to contain multiple folders for my work, starting with the main branch.
2. `cd ~/projects/cool-project` -- again, not a git repo but a parent folder into which I'll be cloning the repository then creating worktrees.
3. `git clone https://github.com/username/cool-project.git main` -- Clone the repository into a new subdirectory called `main`.
  This is important: I now have a directory containing the main branch and **I'll leave this as the main branch on my local machine**.
4. `cd main` -- Now I'm in the git repo for the main branch.
5. `git worktree add ../my-feature1 -b feature-1` -- This is the **new bit**.
   After this I have a new directory adjacent to the main directory called `my-feature1`. This is where I'll work on my feature branch.

    > TIP: My feature branch called `feature-1` is _instantly_ available in my main directory (repo) as well!
    > `cd ../main && git branch` includes `feature-1` in the list of branches. Amaze!
6. Work work work.
7. Still have the usual two options to merge work.
  It's just folder-based:
  
  ```sh
  # Option 1: Traditional merge from main worktree
  cd ~/main                     # main worktree
  git merge feature-1           # directly merge feature-1 branch
  
  # Option 2: Merge from feature1 worktree itself
  cd ~/projects/cool-project/my-feature1       # feature1 worktree
  git rebase main               # rebase on latest main
  cd ../main                    # back to main worktree  
  git merge feature-1           # now it's a fast-forward
  ```
8. Finally, you can cleanup.
  Either `rm -rf ../my-feature1 && git worktree prune` or `git worktree remove ../my-feature1`

## Example

I'm working on the web app for [CalcMark](https://github.com/calcmark/go-calcmark).
I have baseline directory called `~/projects/calcmark` and into that I cloned my main branch as `calcdown-web`.
Then I've been working on a couple of different branches as you can see:

```sh
% tree -L 1
.
├── calcdown-web
├── cursor-fix
└── kbd-shortcuts
```

Or for git's world view:

```sh
% git worktree list
/Users/bitsbyme/projects/calcdown-web/calcdown-web   c1143bd [main]
/Users/bitsbyme/projects/calcdown-web/cursor-fix     c1143bd [cursor-fix]
/Users/bitsbyme/projects/calcdown-web/kbd-shortcuts  c1143bd [keyboard]
```

The thing I've really been enjoying is just `cd`-ing into branches without having to `git stash` and `git stash pop` constantly, or worse yet `git add`-ing files just so I can switch branches.
Sounds basic, but it's made my life a little easier.

## Advantages

* Work on multiple branches at the same time without stashing or staging files.
* Compare WIP. For example, I can `npm run dev` in both of my worktree folders and see the differences in the browser.
* Space efficient.
  I'm not dealing with massive repos, but it's nice not to litter my disk with copies.
  `git worktree`-s just have one copy of the files:
  
```txt
  ┌─────────────────────────────────────┐
  │         Shared .git repository      │
  └─────────────┬───────────────────────┘
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼
  ┌────────┐ ┌────────┐ ┌────────┐
  │ main/  │ │feature1│ │feature2│
  │ work   │ │ work   │ │ work   │
  └────────┘ └────────┘ └────────┘
```

* Branch protection. You actually *can't* checkout the same branch in multiple worktrees.
  It's a good feature because I think we've all probably, at some point, ended up with multiple versions of `main` on our local machine :-\
  
  ```sh
  # In main worktree (on 'main' branch)
  cd ../feature1-worktree
  git checkout main
  # ERROR: 'main' is already checked out at '~/projects/cool-project/main'
  ```
