from django.db.models import Avg, Sum
from django.utils import timezone
from ..models import TimeLog, Category

class AnalysisService:
    @staticmethod
    def get_category_stats(user, days=30):
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        stats = []
        for category in Category.objects.filter(user=user):
            logs = TimeLog.objects.filter(
                task__category=category,
                created_at__gte=start_date
            )
            
            total_time = logs.aggregate(Sum('actual_time'))['actual_time__sum'] or 0
            task_count = logs.count()
            
            stats.append({
                'category': category.name,
                'total_time': total_time,
                'task_count': task_count,
                'avg_time': round(total_time / task_count) if task_count else 0
            })
        
        return stats
    
    @staticmethod
    def get_accuracy_rate(user):
        logs = TimeLog.objects.filter(user=user)
        if not logs.exists():
            return 0
        
        total_diff = 0
        for log in logs:
            diff = abs(log.actual_time - log.task.estimated_time)
            total_diff += diff
        
        avg_diff = total_diff / logs.count()
        max_time = logs.aggregate(Avg('actual_time'))['actual_time__avg'] or 1
        accuracy = max(0, 100 - (avg_diff / max_time * 100))
        
        return round(accuracy, 1)