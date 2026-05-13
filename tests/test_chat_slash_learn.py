"""Tests for the /learn chat slash command.

Three forms:
  /learn <path>     -> ingest a file or directory into the document store
  /learn .          -> shortcut for "ingest the current working directory"
  /learn            -> error: prints usage hint, doesn't ingest anything

Behavior parallels `autodidact learn <path>` — we wire to the same DocumentStore.ingest()
so chat-time learning and CLI learning produce identical results.
"""

from __future__ import annotations

import os
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from autodidact.cli import _dispatch_slash, _handle_learn_command


class _FakeIngestResult:
    def __init__(self, files=3, chunks=42):
        self.files_ingested = files
        self.chunks_created = chunks


class _FakeAgent:
    def __init__(self):
        self.documents = MagicMock()
        self.documents.ingest = MagicMock(return_value=_FakeIngestResult())


# ── _handle_learn_command ──────────────────────────────────────────


class TestHandleLearnCommand:

    def test_learn_with_explicit_path(self, tmp_path):
        agent = _FakeAgent()
        target = tmp_path / "docs"
        target.mkdir()
        _handle_learn_command(agent, f"/learn {target}", renderer=MagicMock())
        agent.documents.ingest.assert_called_once()
        # First positional arg is the resolved Path.
        call_path = agent.documents.ingest.call_args.args[0]
        assert isinstance(call_path, Path)
        assert call_path == target

    def test_learn_dot_uses_cwd(self, tmp_path, monkeypatch):
        """`/learn .` ingests the current working directory."""
        agent = _FakeAgent()
        monkeypatch.chdir(tmp_path)
        _handle_learn_command(agent, "/learn .", renderer=MagicMock())
        call_path = agent.documents.ingest.call_args.args[0]
        # Resolved against cwd at call time.
        assert call_path.resolve() == tmp_path.resolve()

    def test_learn_with_no_arg_is_a_helpful_error(self, capsys):
        agent = _FakeAgent()
        _handle_learn_command(agent, "/learn", renderer=MagicMock())
        # No ingest call.
        agent.documents.ingest.assert_not_called()
        # Helpful message printed.
        out = capsys.readouterr().out
        assert "/learn" in out  # usage hint contains the command itself

    def test_learn_with_nonexistent_path_errors(self, capsys, tmp_path):
        agent = _FakeAgent()
        bogus = tmp_path / "definitely-not-a-real-folder"
        _handle_learn_command(agent, f"/learn {bogus}", renderer=MagicMock())
        agent.documents.ingest.assert_not_called()
        out = capsys.readouterr().out
        assert "does not exist" in out.lower() or "not found" in out.lower()

    def test_learn_with_no_document_store_errors(self, capsys, tmp_path):
        """If the agent has no DocumentStore attached, fail clearly."""
        agent = _FakeAgent()
        agent.documents = None
        target = tmp_path / "x"
        target.mkdir()
        _handle_learn_command(agent, f"/learn {target}", renderer=MagicMock())
        out = capsys.readouterr().out
        assert "document" in out.lower() or "store" in out.lower()

    def test_learn_strips_whitespace_around_path(self, tmp_path):
        agent = _FakeAgent()
        target = tmp_path / "docs"
        target.mkdir()
        _handle_learn_command(agent, f"/learn   {target}   ", renderer=MagicMock())
        agent.documents.ingest.assert_called_once()
        assert agent.documents.ingest.call_args.args[0] == target

    def test_learn_expanduser(self, tmp_path, monkeypatch):
        """`~/foo` should expand to the user's home directory."""
        agent = _FakeAgent()
        # Point HOME at tmp_path so we can predictably check expansion.
        monkeypatch.setenv("HOME", str(tmp_path))
        (tmp_path / "docs").mkdir()
        _handle_learn_command(agent, "/learn ~/docs", renderer=MagicMock())
        call_path = agent.documents.ingest.call_args.args[0]
        assert call_path == tmp_path / "docs"


# ── _dispatch_slash routing ───────────────────────────────────────


class TestDispatchLearn:

    def test_learn_with_path_routed(self, tmp_path):
        agent = _FakeAgent()
        target = tmp_path / "docs"
        target.mkdir()
        handled = _dispatch_slash(agent, f"/learn {target}", renderer=MagicMock())
        assert handled is True
        agent.documents.ingest.assert_called_once()

    def test_learn_dot_routed(self, tmp_path, monkeypatch):
        agent = _FakeAgent()
        monkeypatch.chdir(tmp_path)
        handled = _dispatch_slash(agent, "/learn .", renderer=MagicMock())
        assert handled is True

    def test_learn_alone_routed_with_help(self):
        agent = _FakeAgent()
        handled = _dispatch_slash(agent, "/learn", renderer=MagicMock())
        assert handled is True
        agent.documents.ingest.assert_not_called()

    def test_plain_query_not_handled(self):
        agent = _FakeAgent()
        handled = _dispatch_slash(agent, "learn this codebase", renderer=MagicMock())
        # "learn" without slash is just a normal user query — must NOT be intercepted.
        assert handled is False
        agent.documents.ingest.assert_not_called()

    def test_other_slash_commands_still_route(self):
        """Regression check: /learn doesn't break /wrong, /cloud, /gsa."""
        from unittest.mock import MagicMock as MM
        agent = _FakeAgent()
        agent._history = [
            {"role": "user", "content": "q?"},
            {"role": "assistant", "content": "a"},
        ]
        agent.correct = MM()

        handled_wrong = _dispatch_slash(agent, "/wrong", renderer=MM())
        assert handled_wrong is True
        agent.correct.assert_called_once()
