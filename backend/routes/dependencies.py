from fastapi import Header


def require_user_id(x_user_id: str = Header(..., alias="X-User-Id")) -> str:
  """Ensure the request includes the authenticated user's id."""
  return x_user_id
