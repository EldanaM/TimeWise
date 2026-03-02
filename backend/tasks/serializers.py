from rest_framework import serializers
from .models import Category, Task, TimeLog, Notification

class CategorySerializer(serializers.ModelSerializer):
    tasks_count = serializers.IntegerField(source='tasks.count', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'tasks_count', 'created_at']
        read_only_fields = ['id', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'category', 'category_name',
                  'estimated_time', 'is_completed', 'created_at', 'completed_at']
        read_only_fields = ['id', 'created_at', 'completed_at']

class TimeLogSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TimeLog
        fields = ['id', 'task', 'task_title', 'actual_time', 
                  'start_time', 'end_time', 'created_at']
        read_only_fields = ['id', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'message', 'type', 'task', 'task_title', 
                  'is_read', 'created_at']
        read_only_fields = ['id', 'created_at', 'message', 'type']