from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from routes.dependencies import require_user_id
from services.stripe_client import StripeCheckoutError, create_checkout_session

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
  plan: Literal["monthly", "lifetime"] = "monthly"


@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def start_checkout_session(
  payload: CheckoutRequest,
  user_id: str = Depends(require_user_id),
):
  try:
    session = await create_checkout_session(user_id, plan=payload.plan)
  except StripeCheckoutError as exc:
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
  return {"checkout_url": session.url}
