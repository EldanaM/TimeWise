from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum
from django.utils import timezone
from .models import Category, Task, TimeLog, Notification
from .serializers import (
    CategorySerializer, TaskSerializer, 
    TimeLogSerializer, NotificationSerializer
)
from .analytics.notifications import NotificationService
from .analytics.achievements import AchievementService
from .analytics.analysis import AnalysisService
from .analytics.prediction import PredictionService


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        
        status_param = self.request.query_params.get('status', None)
        if status_param == 'completed':
            queryset = queryset.filter(is_completed=True)
        elif status_param == 'active':
            queryset = queryset.filter(is_completed=False)
        
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset
    
    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        NotificationService.check_task_estimate(task, self.request)
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        task = self.get_object()
        
        if task.user != request.user:
            return Response(
                {'error': 'Это не ваша задача'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        task.is_completed = True
        task.completed_at = timezone.now()
        task.save()
        
        AchievementService.check_achievements(request.user)
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class TimeLogViewSet(viewsets.ModelViewSet):
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TimeLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        task = serializer.validated_data['task']
        
        if task.user != self.request.user:
            raise permissions.PermissionDenied('Это не ваша задача')
        
        timelog = serializer.save(user=self.request.user)
        
        NotificationService.check_time_accuracy(timelog)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        read = self.request.query_params.get('read', None)
        if read == 'true':
            queryset = queryset.filter(is_read=True)
        elif read == 'false':
            queryset = queryset.filter(is_read=False)
        
        return queryset
    
    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        
        if notification.user != request.user:
            return Response(
                {'error': 'Это не ваше уведомление'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.is_read = True
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'{count} уведомлений отмечено как прочитанные',
            'count': count
        })


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        user = request.user
        
        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(user=user, is_completed=True).count()
        active_tasks = total_tasks - completed_tasks
        
        total_time = TimeLog.objects.filter(user=user).aggregate(
            total=Sum('actual_time')
        )['total'] or 0
        
        category_stats = AnalysisService.get_category_stats(user)
        
        accuracy = AnalysisService.get_accuracy_rate(user)
        
        unread_notifications = Notification.objects.filter(
            user=user, is_read=False
        ).count()
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'active_tasks': active_tasks,
            'completion_rate': round(completed_tasks/total_tasks*100) if total_tasks > 0 else 0,
            'total_focus_time': total_time,
            'total_focus_time_hours': round(total_time / 60, 1),
            'category_stats': category_stats,
            'accuracy': accuracy,
            'unread_notifications': unread_notifications
        })