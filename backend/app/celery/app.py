from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("dev_timesheets")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.beat_schedule = {
    "dispatch-reminders": {
        "task": "app.celery.tasks.dispatch_reminders",
        "schedule": 300.0,
    }
}
if settings.environment == "test":
    celery_app.conf.task_always_eager = True
celery_app.autodiscover_tasks(["app.celery.tasks"])
