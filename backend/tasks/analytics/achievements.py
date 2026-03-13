from django.db.models import Sum
from ..models import Notification, Task, TimeLog
from .email_service import EmailService

class AchievementService:
    @staticmethod
    def check_achievements(user):
        achievements = []
        
        completed_tasks = Task.objects.filter(user=user, is_completed=True).count()
        
        if completed_tasks == 1:
            achievements.append({
                'title': 'Первая задача',
                'icon': '🌟',
                'message': 'Поздравляем с первой выполненной задачей!'
            })
        
        if completed_tasks >= 10:
            achievements.append({
                'title': 'Продуктивная неделя',
                'icon': '🏆',
                'message': 'Вы выполнили 10 задач!'
            })
        
        total_time = TimeLog.objects.filter(user=user).aggregate(
            total=Sum('actual_time')
        )['total'] or 0
        
        if total_time >= 600:
            achievements.append({
                'title': 'Мастер времени',
                'icon': '⏰',
                'message': '10 часов продуктивной работы!'
            })
        
        for ach in achievements:
            Notification.objects.create(
                user=user,
                message=f'{ach["icon"]} {ach["title"]}!\n\n{ach["message"]}',
                type='success'
            )
            EmailService.achievement_notification(user, ach)