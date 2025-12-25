"""
Repository layer: encapsulates all database access.
Use these classes to isolate queries so business logic doesn't depend on ORM details.
"""
from . import models


class MemberRepository:
    """Handle all Member database operations."""

    @staticmethod
    def get_by_username(username):
        """Retrieve a member by username."""
        return models.Member.objects.filter(username=username).first()

    @staticmethod
    def get_by_id(member_id):
        """Retrieve a member by ID."""
        return models.Member.objects.filter(id=member_id).first()

    @staticmethod
    def get_by_name(name):
        """Retrieve a member by name."""
        return models.Member.objects.filter(name=name).first()

    @staticmethod
    def create(username, name, gmail, password):
        """Create and return a new Member."""
        return models.Member.objects.create(
            username=username, name=name, gmail=gmail, password=password
        )

    @staticmethod
    def username_exists(username):
        """Check if username is already taken."""
        return models.Member.objects.filter(username=username).exists()


class TeamRepository:
    """Handle all Team database operations."""

    @staticmethod
    def get_by_id(team_id):
        """Retrieve a team by ID."""
        return models.Team.objects.filter(id=team_id).first()

    @staticmethod
    def get_by_name(name):
        """Retrieve a team by name."""
        return models.Team.objects.filter(name=name).first()

    @staticmethod
    def create(name):
        """Create and return a new Team."""
        return models.Team.objects.create(name=name)


class TeamMemberRepository:
    """Handle all TeamMember database operations."""

    @staticmethod
    def get_by_id(team_member_id):
        """Retrieve a TeamMember by ID."""
        return models.TeamMember.objects.filter(id=team_member_id).first()

    @staticmethod
    def get_by_member_and_team(member, team):
        """Retrieve a TeamMember by member and team."""
        return models.TeamMember.objects.filter(member=member, team=team).first()

    @staticmethod
    def get_admin_for_member(member):
        """Get the admin team membership for a member (if any)."""
        return models.TeamMember.objects.filter(member=member, is_admin=True).first()

    @staticmethod
    def get_all_for_team(team):
        """Get all members of a team."""
        return models.TeamMember.objects.filter(team=team)

    @staticmethod
    def create(team, member, is_admin=False):
        """Create and return a new TeamMember."""
        return models.TeamMember.objects.create(
            team=team, member=member, is_admin=is_admin
        )

    @staticmethod
    def delete(team_member,m):
        """Delete a TeamMember."""
        team_member.delete()
        m.delete()


class TaskRepository:
    """Handle all Task database operations."""

    @staticmethod
    def get_by_id(task_id):
        """Retrieve a task by ID."""
        return models.Task.objects.filter(id=task_id).first()

    @staticmethod
    def get_by_name(name):
        """Retrieve a task by name (or create if not exists)."""
        task, created = models.Task.objects.get_or_create(name_task=name)
        return task


class TeamMemberTaskRepository:
    """Handle all TeamMemberTask database operations."""

    @staticmethod
    def get_by_id(task_id):
        """Retrieve a TeamMemberTask by ID."""
        return models.TeamMemberTask.objects.filter(id=task_id).first()

    @staticmethod
    def get_all_for_member(member):
        """Get all tasks assigned to a member."""
        return models.TeamMemberTask.objects.filter(team_member__member=member)

    @staticmethod
    def get_all_for_team(team):
        """Get all tasks in a team."""
        return models.TeamMemberTask.objects.filter(team_member__team=team)

    @staticmethod
    def create(task, team_member, start_date, end_date):
        """Create and return a new TeamMemberTask."""
        return models.TeamMemberTask.objects.create(
            task=task,
            team_member=team_member,
            start_date=start_date,
            end_date=end_date,
            is_finish=False,
        )

    @staticmethod
    def update(team_member_task, task, team_member, start_date, end_date, is_finish):
        """Update a TeamMemberTask."""
        team_member_task.task = task
        team_member_task.team_member = team_member
        team_member_task.start_date = start_date
        team_member_task.end_date = end_date
        team_member_task.is_finish = is_finish
        team_member_task.save()
        return team_member_task

    @staticmethod
    def mark_complete(team_member_task):
        """Mark a TeamMemberTask as complete."""
        team_member_task.is_finish = True
        team_member_task.save()
        return team_member_task

    @staticmethod
    def delete(team_member_task):
        """Delete a TeamMemberTask."""
        team_member_task.delete()
