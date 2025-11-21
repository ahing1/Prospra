"""
Deprecated compatibility shim for earlier misspelled module name.

Prefer importing from `db.database`.
"""

from .database import *  # noqa: F401,F403
