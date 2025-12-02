from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project, User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.projects = ProjectRepository(session)

    async def list_for_user(self, user: User) -> list[Project]:
        return await self.projects.list_by_owner(user.id)

    async def create(self, user: User, data: ProjectCreate) -> Project:
        project = Project(
            name=data.name,
            description=data.description,
            color=data.color,
            owner_id=user.id,
        )
        await self.projects.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def update(self, user: User, project_id: int, data: ProjectUpdate) -> Project:
        project = await self._get_owned_project(user, project_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def archive(self, user: User, project_id: int) -> Project:
        project = await self._get_owned_project(user, project_id)
        project.is_archived = True
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def _get_owned_project(self, user: User, project_id: int) -> Project:
        project = await self.projects.get(project_id)
        if not project or project.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )
        return project
