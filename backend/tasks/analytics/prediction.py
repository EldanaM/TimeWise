from django.db.models import Avg
from ..models import TimeLog

class PredictionService:
    @staticmethod
    def predict_task_time(task):
        avg_time = TimeLog.objects.filter(
            task__category=task.category
        ).aggregate(Avg('actual_time'))['actual_time__avg']
        
        if not avg_time:
            return task.estimated_time
        
        return round(avg_time)