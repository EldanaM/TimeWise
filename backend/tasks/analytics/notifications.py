from django.db.models import Avg
from ..models import Notification, TimeLog

class NotificationService:
    @staticmethod
    def check_task_estimate(task, request):
        avg_time = TimeLog.objects.filter(
            task__category=task.category
        ).aggregate(Avg('actual_time'))['actual_time__avg']
        
        if not avg_time:
            return
        
        if task.estimated_time < avg_time * 0.5:
            Notification.objects.create(
                user=request.user,
                message=f'Задача "{task.title}" оценена в {task.estimated_time} мин, '
                       f'хотя обычно занимает {round(avg_time)} мин',
                type='warning',
                task=task
            )
    
    @staticmethod
    def check_time_accuracy(timelog):
        task = timelog.task
        diff = timelog.actual_time - task.estimated_time
        user = timelog.user
        
        if abs(diff) >= 15:
            if diff < 0:
                message = f'Задача "{task.title}" выполнена на {abs(diff)} мин быстрее!'
                notif_type = 'success'
            else:
                message = f'Задача "{task.title}" заняла на {diff} мин больше'
                notif_type = 'info'
            
            Notification.objects.create(
                user=user,
                message=message,
                type=notif_type,
                task=task
            )