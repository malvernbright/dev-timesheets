from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IntegrationToken, User
from app.repositories.integration_repository import IntegrationRepository
from app.schemas.integration import IntegrationCreate


class IntegrationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.integrations = IntegrationRepository(session)

    async def upsert_token(
        self, user: User, payload: IntegrationCreate
    ) -> IntegrationToken:
        existing = await self.integrations.get_by_provider(user.id, payload.provider)
        if existing:
            existing.access_token = payload.access_token
            existing.details = payload.details
            await self.session.commit()
            await self.session.refresh(existing)
            return existing

        token = IntegrationToken(user_id=user.id, **payload.model_dump())
        await self.integrations.add(token)
        await self.session.commit()
        await self.session.refresh(token)
        return token

    async def list_tokens(self, user: User) -> list[IntegrationToken]:
        return await self.integrations.list(user_id=user.id)
