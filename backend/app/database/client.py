"""
Supabase client provider.
Safely connects to Supabase when URL and KEY are provided in environment variables,
or returns None to support isolated offline demo execution.
"""
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

_supabase_client = None


def get_supabase_client():
    """
    Returns an initialized Supabase Client, or None if credentials are not configured.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.supabase_url or not settings.supabase_anon_key:
        logger.info("Supabase credentials not configured. Operating in local in-memory/demo mode.")
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(settings.supabase_url, settings.supabase_anon_key)
        logger.info("Connected to Supabase successfully at %s", settings.supabase_url)
        return _supabase_client
    except Exception as exc:
        logger.warning("Could not initialize Supabase client: %s", exc)
        return None
