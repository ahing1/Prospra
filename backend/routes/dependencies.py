from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from services.entitlements import UserEntitlement, fetch_user_entitlement


def require_user_id(x_user_id: str = Header(..., alias="X-User-Id")) -> str:
  """Ensure the request includes the authenticated user's id."""
  return x_user_id


async def require_entitlement(
  user_id: str = Depends(require_user_id),
  db: AsyncSession = Depends(get_db),
) -> UserEntitlement:
  """FastAPI dependency that enforces a paid subscription."""
  entitlement = await fetch_user_entitlement(db, user_id)
  if not entitlement.entitled:
    raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Pro subscription required.")
  return entitlement
