"""
Service layer: encapsulates business logic and orchestrates repositories.
All authentication, validation, and business rules go here.
"""
from re import M
from .repositories import (
    MemberRepository,
    TeamRepository,
    TeamMemberRepository,
    TaskRepository,
    TeamMemberTaskRepository,
)


class AuthService:
    """Handle all authentication and registration logic."""

    @staticmethod
    def login(username, password):
        """
        Authenticate a user.
        Returns tuple: (member, is_admin, error_message)
        """
        if not username or not password:
            return (None, False, "Username and password are required")

        member = MemberRepository.get_by_username(username)
        if not member or member.password != password:
            return (None, False, "Invalid credentials")

        team_member = TeamMemberRepository.get_admin_for_member(member)
        is_admin = bool(team_member)
        return (member, is_admin, None)

    @staticmethod
    def register(username, name, gmail, password, team_name):
        """
        Register a new user and create their team.
        Returns tuple: (member, error_message)
        """
        if not all([username, name, gmail, password, team_name]):
            return (None, "All fields are required")

        if MemberRepository.username_exists(username):
            return (None, "Username already exists")

        member = MemberRepository.create(username, name, gmail, password)
        team = TeamRepository.create(team_name)
        TeamMemberRepository.create(team, member, is_admin=True)

        return (member, None)


class TeamService:
    """Handle team management logic."""

    @staticmethod
    def add_member_to_team(admin_member, username, name, gmail, password):
        """
        Add a new member to the admin's team.
        Returns tuple: (team_member, error_message)
        """
        if not all([username, name, gmail, password]):
            return (None, "All fields are required")

        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return (None, "You don't have admin access to any team")

        if MemberRepository.username_exists(username):
            return (None, "Username already exists")

        new_member = MemberRepository.create(username, name, gmail, password)
        team_member = TeamMemberRepository.create(admin_tm.team, new_member, is_admin=False)
        return (team_member, None)

    @staticmethod
    def remove_member(admin_member, member_id):
        """
        Remove a member from the admin's team.
        Returns: error_message or None if successful
        """
        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return "You don't have admin access to any team"

        tm = TeamMemberRepository.get_by_id(member_id)
        m = MemberRepository.get_by_id(member_id)
        if not tm:
            return "Team member not found"

        if tm.team != admin_tm.team:
            return "You don't have permission to delete this team member"

        TeamMemberRepository.delete(tm,m)
        return None

    @staticmethod
    def edit_member(admin_member, member_id, new_name, new_username, new_email, new_password):
        """
        Edit a member's details.
        Returns: error_message or None if successful
        """
        if not all([new_name, new_username, new_email, new_password]):
            return "All fields are required"

        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return "You don't have admin access to any team"

        tm = TeamMemberRepository.get_by_id(member_id)
        if not tm:
            return "Team member not found"

        if tm.team != admin_tm.team:
            return "You don't have permission to edit this member"

        # Check if new username already exists (and isn't the current one)
        if new_username != tm.member.username and MemberRepository.username_exists(new_username):
            return "Username already exists"

        tm.member.name = new_name
        tm.member.username = new_username
        tm.member.gmail = new_email
        tm.member.password = new_password
        tm.member.save()

        return None


class TaskService:
    """Handle task management logic."""

    @staticmethod
    def add_task(admin_member, task_name, team_member_id, start_date, end_date):
        """
        Create and assign a task.
        Returns tuple: (team_member_task, error_message)
        """
        if not all([task_name, team_member_id, start_date, end_date]):
            return (None, "All fields are required")

        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return (None, "You don't have admin access to any team")

        team = admin_tm.team
        tm = TeamMemberRepository.get_by_id(team_member_id)
        if not tm or tm.team != team:
            return (None, "Selected team member is invalid")

        task = TaskRepository.get_by_name(task_name)
        team_member_task = TeamMemberTaskRepository.create(task, tm, start_date, end_date)
        return (team_member_task, None)

    @staticmethod
    def edit_task(admin_member, task_id, task_name, team_member_id, start_date, end_date):
        """
        Edit an existing task.
        Returns: error_message or None if successful
        """
        if not all([task_name, team_member_id, start_date, end_date]):
            return "All fields are required"

        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return "You don't have admin access to any team"

        team = admin_tm.team
        tmt = TeamMemberTaskRepository.get_by_id(task_id)
        if not tmt:
            return "Task not found"

        if tmt.team_member.team != team:
            return "You don't have permission to edit this task"

        tm = TeamMemberRepository.get_by_id(team_member_id)
        if not tm or tm.team != team:
            return "Selected team member is invalid"

        task = TaskRepository.get_by_name(task_name)
        TeamMemberTaskRepository.update(tmt, task, tm, start_date, end_date, False)
        return None

    @staticmethod
    def delete_task(admin_member, task_id):
        """
        Delete a task.
        Returns: error_message or None if successful
        """
        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return "You don't have admin access to any team"

        team = admin_tm.team
        tmt = TeamMemberTaskRepository.get_by_id(task_id)
        if not tmt:
            return "Task not found"

        if tmt.team_member.team != team:
            return "You don't have permission to delete this task"

        TeamMemberTaskRepository.delete(tmt)
        return None

    @staticmethod
    def mark_task_complete(member, task_id):
        """
        Mark a task as complete (member only).
        Returns: error_message or None if successful
        """
        tmt = TeamMemberTaskRepository.get_by_id(task_id)
        if not tmt:
            return "Task not found"

        if tmt.team_member.member != member:
            return "You don't have permission to update this task"

        TeamMemberTaskRepository.mark_complete(tmt)
        return None


class ViewService:
    """Handle view/dashboard data retrieval logic."""

    @staticmethod
    def get_member_tasks(member):
        """Get all tasks for a member."""
        return TeamMemberTaskRepository.get_all_for_member(member)

    @staticmethod
    def get_team_dashboard(admin_member):
        """
        Get dashboard data for admin.
        Returns tuple: (team, team_members, team_tasks, error_message)
        """
        admin_tm = TeamMemberRepository.get_admin_for_member(admin_member)
        if not admin_tm:
            return (None, None, None, "You don't have admin access to any team")

        team = admin_tm.team
        team_members = TeamMemberRepository.get_all_for_team(team)
        team_tasks = TeamMemberTaskRepository.get_all_for_team(team)

        return (team, team_members, team_tasks, None)
