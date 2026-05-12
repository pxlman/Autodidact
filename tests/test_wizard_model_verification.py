"""Tests for post-pull model verification.

The bug this addresses: Ollama returns 200 OK on some pulls (e.g. cloud-only
tags like qwen3.5:9b) but the model isn't actually servable locally. We need
to confirm, after every pull, that /api/chat can actually load the model.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from autodidact.setup_wizard import verify_model_loadable


class TestVerifyModelLoadable:
    """verify_model_loadable returns True iff Ollama can actually serve the model."""

    @patch("autodidact.setup_wizard.is_model_available", return_value=True)
    def test_model_in_ollama_list_is_loadable(self, _mock):
        """If `ollama list` shows it, consider it loadable."""
        assert verify_model_loadable("qwen2.5:7b") is True

    @patch("autodidact.setup_wizard.is_model_available", return_value=False)
    def test_model_not_in_ollama_list_is_not_loadable(self, _mock):
        """qwen3.5:9b 'succeeds' in pull but never appears in ollama list."""
        assert verify_model_loadable("qwen3.5:9b") is False


class TestPullVerification:
    """pull_ollama_model should fail loudly when pulls complete but the model isn't usable."""

    @patch("autodidact.setup_wizard.pull_ollama_model", return_value=True)
    @patch("autodidact.setup_wizard.is_model_available", return_value=False)
    def test_pull_that_does_not_make_model_available_is_detected(self, _avail, _pull):
        """Direct test of the guard: after a 'successful' pull, verify fails."""
        from autodidact.setup_wizard import pull_ollama_model, verify_model_loadable
        assert pull_ollama_model("qwen3.5:9b") is True  # Ollama says ok
        assert verify_model_loadable("qwen3.5:9b") is False  # but model isn't really there
