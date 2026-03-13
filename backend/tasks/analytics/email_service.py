from django.core.mail import send_mail
from django.conf import settings

class EmailService:
    @staticmethod
    def send_notification(user, subject, message):
        if not user.email:
            print(f"User {user.username} has no email")
            return False
            
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email], 
                fail_silently=False,
            )
            print(f"Email sent to {user.email}")
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False
    
    @staticmethod
    def task_estimate_notification(task, user):
        subject = f'TimeWise: Проверь оценку задачи "{task.title}"'
        message = f'''
Здравствуйте, {user.username}!

Задача "{task.title}" оценена в {task.estimated_time} минут.

 Проверьте, реалистична ли эта оценка.

--
С уважением,
TimeWise
        '''
        return EmailService.send_notification(user, subject, message)
    
    @staticmethod
    def task_completed_notification(task, user, diff):
        if diff < 0:
            subject = f' Отлично! Задача выполнена быстрее'
            message = f'''
Здравствуйте, {user.username}!

Задача "{task.title}" выполнена на {abs(diff)} минут быстрее!

Планировали: {task.estimated_time} мин
Фактически: {task.estimated_time + diff} мин

Так держать! 
'''
        else:
            subject = f' Задача "{task.title}" выполнена'
            message = f'''
Здравствуйте, {user.username}!

Задача "{task.title}" выполнена.

Планировали: {task.estimated_time} мин
Фактически: {task.estimated_time + diff} мин
Разница: +{diff} мин

Учтите это при планировании.
'''
        return EmailService.send_notification(user, subject, message)
    
    @staticmethod
    def achievement_notification(user, achievement):
        subject = f'{achievement["icon"]} Новое достижение: {achievement["title"]}'
        message = f'''
Здравствуйте, {user.username}!

{achievement["icon"]} {achievement["title"]}!
{achievement["message"]}

Продолжайте в том же духе! 
'''
        return EmailService.send_notification(user, subject, message)