# from django.contrib import admin
from django.urls import path, include # path: is a way to link the view.function to the user include: a groupe of urls in one place
from . import views 
# from .api import router as api_router 

urlpatterns = [
    path('', views.spa_index, name='spa_index'),
    path('csrf-token/', views.get_csrf_token, name='csrf_token'),
    path('login/', views.login, name='login'),
    path('view/', views.view, name='view'),
    path('register/', views.register, name='register'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add-member/', views.add_member, name='add_member'),
    path('add-task/', views.add_task, name='add_task'),
    path('mark-task-complete/<int:task_id>/', views.mark_task_complete, name='mark_task_complete'),
    path('edit-task/<int:task_id>/', views.edit_task, name='edit_task'),  # type: ignore[arg-type]
    path('delete-task/<int:task_id>/', views.delete_task, name='delete_task'),
    path('edit-member/<int:member_id>/', views.edit_member, name='edit_member'), # type: ignore[arg-type]
    path('delete-member/<int:member_id>/', views.delete_member, name='delete_member'),
 
    # DRF API routes
    # path('api/', include(api_router.urls)),

]
