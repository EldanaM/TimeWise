from django.contrib import admin
from .models import Category, Task, TimeLog, Notification

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at']
    list_filter = ['user']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'user', 'estimated_time', 'is_completed']
    list_filter = ['is_completed', 'category', 'user']

@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    list_display = ['task', 'actual_time', 'user', 'created_at']
    list_filter = ['user']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'is_read', 'created_at']
    list_filter = ['type', 'is_read', 'user']