from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'time-logs', views.TimeLogViewSet, basename='timelog')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]