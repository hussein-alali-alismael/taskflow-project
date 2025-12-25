"""Views for the Taskflow application.

This module implements the HTTP views that power the single-page
application (SPA) and the JSON API used by the React frontend.

Design goals:
- Use the authenticated member's unique `username` stored in session
    to resolve database records (avoids ambiguity when display `name`
    values collide).
- Provide clear JSON error responses for the SPA to surface to users.

Each view that returns JSON will return a helpful `error` field on
failure and use appropriate HTTP status codes.
"""

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from .services import AuthService, TeamService, TaskService, ViewService
from .repositories import MemberRepository, TeamMemberRepository, TeamMemberTaskRepository
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response


def _is_api_request(request):
    """Detect whether the incoming request is an API/ajax call.

    The SPA should receive the HTML index page for normal browser navigations
    (which accept `text/html`). API calls (XHR/fetch) typically accept
    `application/json`, set `X-Requested-With: XMLHttpRequest`, or use a
    JSON content-type. This helper centralizes that detection logic.

    Args:
        request (HttpRequest): Django request instance.

    Returns:
        bool: True when the request appears to be an AJAX or API request.
    """
    accept = request.META.get('HTTP_ACCEPT', '')
    if 'application/json' in accept:
        return True
    xrw = request.META.get('HTTP_X_REQUESTED_WITH', '')
    if xrw == 'XMLHttpRequest':
        return True
    # Content type for POST/PUT with JSON payloads
    if getattr(request, 'content_type', '') == 'application/json':
        return True
    return False

@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    """Ensure the CSRF cookie is present and return a confirmation JSON.

    The frontend calls this endpoint before performing state-changing
    operations (login/register) to ensure Django sets the `csrftoken` cookie.
    The decorator `ensure_csrf_cookie` guarantees the cookie will be added
    to the response when needed.
    """
    return JsonResponse({'detail': 'CSRF cookie set'})

def login(request):
    """Authenticate a user and initialize the session.

    POST: expects `username` and `password`. On successful authentication the
    view stores the unique `member_username` in the session and returns JSON
    containing `member_name`, `member_username`, and `is_admin` so the SPA can
    persist identity and redirect appropriately.

    Non-API GETs fall back to serving the SPA index so direct navigations
    continue to work.
    """
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()

        member, is_admin, error = AuthService.login(username, password)
        if error or not member:
            return JsonResponse({'error': error or 'Login failed'}, status=401)

        # Use username in session as the canonical identifier (unique)
        request.session["member_username"] = member.username
        return JsonResponse({'member_name': member.name, 'member_username': member.username, 'is_admin': is_admin})

    return spa_index(request)
    
def register(request):
    """Register a new user and create their team.

    POST parameters: `username`, `name`, `gmail`, `password`, `team_name`.
    On success, the created member's username is stored in the session and
    the response contains both `member_name` and `member_username`.
    """
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        name = request.POST.get('name', '').strip()
        gmail = request.POST.get('gmail', '').strip()
        password = request.POST.get('password', '').strip()
        team_name = request.POST.get('team_name', '').strip()

        member, error = AuthService.register(username, name, gmail, password, team_name)
        if error or not member:
            return JsonResponse({'error': error or 'Registration failed'}, status=400 if error and 'required' in error else 409)

        request.session["member_username"] = member.username
        return JsonResponse({'member_name': member.name, 'member_username': member.username, 'is_admin': True}, status=201)

    return spa_index(request)

def view(request):
    """Return tasks assigned to the authenticated member.

    This endpoint serves two modes:
    - Browser navigation (non-API GET): returns the SPA index HTML so the
      React app can mount and handle routing.
    - API GET: returns JSON with the authenticated member's tasks.

    Authentication/identity is determined by `member_username` stored in the
    session during login/registration. If the session does not contain that
    value the view returns the SPA index so the React app's router can redirect
    to login.
    """
    if request.method == 'GET' and not _is_api_request(request):
        return spa_index(request)

    member_username = request.session.get("member_username")
    if not member_username:
        return spa_index(request)

    member = MemberRepository.get_by_username(member_username)
    if not member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    # Get all tasks assigned to this member
    team_tasks = ViewService.get_member_tasks(member)

    tasks_data = []
    for task in team_tasks:
        tasks_data.append({
            'id': task.id,  # type: ignore[arg-type]
            'task_name': task.task.name_task,
            'team_name': task.team_member.team.name,
            'start_date': str(task.start_date),
            'end_date': str(task.end_date),
            'is_finish': task.is_finish,
        })

    return JsonResponse({
        'member_name': member.name,
        'team_tasks': tasks_data,
    })


def dashboard(request):
    """Return dashboard data (team members and team tasks) for admins.

    Only users who have an admin TeamMember record for a team will receive
    dashboard data. The view returns a JSON payload containing serialized
    `team_members` and `team_tasks` for the admin's team. Non-API requests
    return the SPA index to allow browser navigation.
    """
    if request.method == 'GET' and not _is_api_request(request):
        return spa_index(request)

    member_username = request.session.get("member_username")
    if not member_username:
        return spa_index(request)

    member = MemberRepository.get_by_username(member_username)
    if not member:
        return JsonResponse({'error': 'Member not found.'}, status=404)

    team, team_members, team_tasks, error = ViewService.get_team_dashboard(member)
    if error or not team or team_members is None or team_tasks is None:
        return JsonResponse({'error': error or 'Dashboard data not found.'}, status=403)

    members_data = []
    for tm in team_members:
        members_data.append({
            'id': tm.id,  # type: ignore[arg-type]
            'name': tm.member.name,
            'username': tm.member.username,
            'gmail': tm.member.gmail,
            'is_admin': tm.is_admin,
        })

    tasks_data = []
    for task in team_tasks:
        tasks_data.append({
            'id': task.id,  # type: ignore[arg-type]
            'task_name': task.task.name_task,
            'assigned_to': task.team_member.member.name,
            'start_date': str(task.start_date),
            'end_date': str(task.end_date),
            'is_finish': task.is_finish,
        })

    return JsonResponse({
        'member_name': member.name,
        'team_members': members_data,
        'team_tasks': tasks_data,
    })


def add_member(request):
    """Add a new member to the admin's team.

    Expects POST form fields: `username`, `name`, `gmail`, `password`.
    Only a user who has an admin TeamMember entry can perform this action.

    Returns a success JSON with HTTP 201 on creation, or a JSON error with
    appropriate status code on failure.
    """
    if request.method != 'POST':
        return spa_index(request)

    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    admin_member = MemberRepository.get_by_username(member_username)
    if not admin_member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    username = request.POST.get('username', '').strip()
    name = request.POST.get('name', '').strip()
    gmail = request.POST.get('gmail', '').strip()
    password = request.POST.get('password', '').strip()

    team_member, error = TeamService.add_member_to_team(admin_member, username, name, gmail, password)
    if error:
        return JsonResponse({'error': error}, status=400 if 'required' in error else 409)

    return JsonResponse({'message': f'Member "{name}" added to team.'}, status=201)
def delete_member(request, member_id):
    """Admin-only: remove a TeamMember from the admin's team.

    Note: this function currently resolves the acting admin using
    `member_name` from the session. The project prefers `member_username` as
    the canonical identity; consider migrating this view to use
    `member_username` (consistency) if you update session handling.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    
    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    admin_member = MemberRepository.get_by_username(member_username)
    if not admin_member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    error = TeamService.remove_member(admin_member, member_id)
    if error:
        return JsonResponse({'error': error}, status=404 if 'not found' in error.lower() else 403)
    return JsonResponse({'message': 'Member deleted.'})

def edit_member(request, member_id):
    """Admin-only: fetch or update a TeamMember's details.

    - GET: return the serialized TeamMember data for the SPA edit form.
    - POST: update the member's profile (name, username, email, password).

    As with `delete_member`, this view currently uses `member_name` from the
    session to resolve the acting admin. Consider standardizing on
    `member_username` to avoid ambiguity when display names collide.
    """
    
    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    admin_member = MemberRepository.get_by_username(member_username)
    if not admin_member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    if request.method == 'GET':
        tm = TeamMemberRepository.get_by_id(member_id)
        if not tm:
            return JsonResponse({'error': 'Team member not found.'}, status=404)

        return JsonResponse({
            'team_member': {
                'id': tm.id, # type: ignore[arg-type]
                'name': tm.member.name,
                'username': tm.member.username,
                'gmail': tm.member.gmail,
                'is_admin': tm.is_admin,
            },
            # return admin display name and username for frontend convenience
            'member_name': admin_member.name,
            'member_username': admin_member.username,
        })

    if request.method == 'POST':
        new_name = request.POST.get('member_name', '').strip()
        new_username = request.POST.get('member_username', '').strip()
        new_email = request.POST.get('member_email', '').strip()
        new_password = request.POST.get('member_password', '').strip()

        error = TeamService.edit_member(admin_member, member_id, new_name, new_username, new_email, new_password)
        if error:
            return JsonResponse({'error': error}, status=400 if 'required' in error else 409)
        return JsonResponse({'message': 'Member updated.'})


def add_task(request):
    """Create and assign a task to a team member.

    POST fields: `task_name`, `team_member_id`, `start_date`, `end_date`.
    Only an admin for a team may create tasks for that team. Returns 201 on
    success or an error JSON with 400/403 on validation/permission errors.
    """
    if request.method != 'POST':
        return spa_index(request)

    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    admin_member = MemberRepository.get_by_username(member_username)
    if not admin_member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    task_name = request.POST.get('task_name', '').strip()
    team_member_id = request.POST.get('team_member_id', '').strip()
    start_date = request.POST.get('start_date', '').strip()
    end_date = request.POST.get('end_date', '').strip()

    team_member_task, error = TaskService.add_task(admin_member, task_name, team_member_id, start_date, end_date)
    if error:
        return JsonResponse({'error': error}, status=400 if 'required' in error else 403)

    return JsonResponse({'message': f'Task "{task_name}" assigned.'}, status=201)


def mark_task_complete(request, task_id):
    """Mark a specific TeamMemberTask as complete.

    This action is performed by the member to whom the task is assigned.
    The view validates that the authenticated member owns the task before
    marking it complete.
    """
    if request.method != 'POST':
        return spa_index(request)

    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    member = MemberRepository.get_by_username(member_username)
    if not member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    error = TaskService.mark_task_complete(member, task_id)
    if error:
        status_code = 404 if 'not found' in error.lower() else 403
        return JsonResponse({'error': error}, status=status_code)

    return JsonResponse({'message': 'Task marked as complete.'})


def edit_task(request, task_id):
    """Admin-only: edit an existing TeamMemberTask.

    POST: update task fields (`task_name`, `team_member_id`, `start_date`,
    `end_date`). The service enforces that only an admin for the task's team may
    perform the update.
    """
    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    admin_member = MemberRepository.get_by_username(member_username)
    if not admin_member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    if request.method == 'POST':
        task_name = request.POST.get('task_name', '').strip()
        team_member_id = request.POST.get('team_member_id', '').strip()
        start_date = request.POST.get('start_date', '').strip()
        end_date = request.POST.get('end_date', '').strip()

        error = TaskService.edit_task(admin_member, task_id, task_name, team_member_id, start_date, end_date)
        if error:
            return JsonResponse({'error': error}, status=400 if 'required' in error else 403)
        return JsonResponse({'message': 'Task updated.'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def delete_task(request, task_id):
    """Admin-only: delete a TeamMemberTask from the admin's team.

    The view expects a POST request and will return an error if the authenticated
    user is not an admin for the affected team or if the task cannot be found.
    """
    if request.method != 'POST':
        return spa_index(request)

    member_username = request.session.get('member_username')
    if not member_username:
        return JsonResponse({'error': 'Please log in first.'}, status=401)

    admin_member = MemberRepository.get_by_username(member_username)
    if not admin_member:
        return JsonResponse({'error': 'User not found.'}, status=404)

    error = TaskService.delete_task(admin_member, task_id)
    if error:
        return JsonResponse({'error': error}, status=404 if 'not found' in error.lower() else 403)
    return JsonResponse({'message': 'Task deleted.'})



def spa_index(request):
    """Serve the built SPA index.html from static files.

    This view returns the `static/frontend/index.html` file so visiting `/`
    serves the React app. In production WhiteNoise or the webserver should
    serve static files directly; this view is a safe fallback.
    """
    index_path = os.path.join(settings.BASE_DIR, 'static', 'frontend', 'index.html')
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    raise Http404('SPA index not found')
