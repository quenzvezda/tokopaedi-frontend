#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) - $1"
  }

  readonly hook_name="$0"
  case "$hook_name" in
    *pre-commit|*prepare-commit-msg|*commit-msg|*post-commit|*pre-rebase|*post-rewrite|*pre-push|*pre-auto-gc|*post-checkout|*post-merge|*pre-merge-commit|*applypatch-msg|*pre-applypatch|*post-applypatch|*pre-push|*push-to-checks)
      ;; # valid hook names
    *)
      echo "husky - invalid hook name"
      return 0
      ;;
  esac

  export readonly husky_skip_init=1
  sh -e "$hook_name" "$@"
  exitCode="$?"
  unset husky_skip_init
  exit "$exitCode"
fi

