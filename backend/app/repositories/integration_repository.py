from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IntegrationToken
from app.repositories.base import Repository


class IntegrationRepository(Repository[IntegrationToken]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, IntegrationToken)

    async def get_by_provider(
        self, user_id: int, provider: str
    ) -> IntegrationToken | None:
        stmt = select(IntegrationToken).where(
            IntegrationToken.user_id == user_id, IntegrationToken.provider == provider
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
